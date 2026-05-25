import type { CaseData, FDI } from '$lib/types';
import { CANINES, ESTHETIC_ZONE, isAnterior } from '$lib/types';
import { archTeeth, type ArchKey, type EdentulousSpan } from './spans';

export type EstheticTier =
	| 'no-anterior-loss'
	| 'single-tooth'
	| 'two-three-teeth'
	| 'four-teeth'
	| 'five-plus-teeth'
	| 'canine-to-canine';

export interface EstheticAnalysis {
	arch: ArchKey;
	missingAnteriorCount: number;
	missingCanines: FDI[];
	tier: EstheticTier;
	hasAnteriorAbutment: boolean;
	abutmentsInEstheticZone: FDI[];
	posteriorAbutments: FDI[];
	primaryStrategy: string;
	alternatives: string[];
	references: { source: string; page?: string }[];
}

const REF_STEWART: { source: string; page?: string } = {
	source: 'Phoenix RD. Stewart\'s Clinical RPD (4th ed., 2008)',
	page: 'Ch. 7 — Class IV / Anterior bounded design'
};

const REF_MCCRACKEN: { source: string; page?: string } = {
	source: "McCracken's RPD (Carr & Brown, 13th ed., 2016)",
	page: 'Ch. 6 — Direct retainer; Ch. 11 — Specific design considerations'
};

export function analyzeEsthetic(
	arch: ArchKey,
	data: CaseData,
	spans: EdentulousSpan[],
	abutments: FDI[]
): EstheticAnalysis {
	const archEstheticZone = [...ESTHETIC_ZONE].filter((f) =>
		arch === 'maxilla' ? f < 30 : f >= 30
	);
	const missingAnteriorCount = archEstheticZone.filter(
		(f) => data.teeth[f as FDI].status === 'missing'
	).length;
	const missingCanines: FDI[] = [...CANINES]
		.filter((f) => (arch === 'maxilla' ? f < 30 : f >= 30))
		.filter((f) => data.teeth[f as FDI].status === 'missing');

	const abutmentsInEstheticZone = abutments.filter((f) => isAnterior(f));
	// "Posterior abutments" for esthetic strategy = present posterior teeth eligible
	// to carry direct retainers (e.g. reverse Akers). These don't need to already be
	// saddle-adjacent abutments in the Kennedy sense.
	const archAll = archTeeth(arch, true);
	const posteriorAbutments = archAll.filter(
		(f) =>
			!isAnterior(f) &&
			data.teeth[f].status === 'present' &&
			data.teeth[f].prognosis !== 'poor' &&
			data.teeth[f].crownRoot !== 'unfavorable'
	);
	const hasAnteriorAbutment = abutmentsInEstheticZone.length > 0;

	const tier = determineTier(missingAnteriorCount, missingCanines.length, archEstheticZone.length);

	// Pick representative posterior teeth (max 2: one right, one left) for clasp suggestions
	const representativePosteriors = pickRepresentativePosteriors(posteriorAbutments);

	return {
		arch,
		missingAnteriorCount,
		missingCanines,
		tier,
		hasAnteriorAbutment,
		abutmentsInEstheticZone,
		posteriorAbutments: representativePosteriors,
		...strategyFor(tier, abutmentsInEstheticZone, representativePosteriors, missingCanines.length),
		references: [REF_STEWART, REF_MCCRACKEN]
	};
}

/** Pick most-posterior tooth on each side (max 2 total) — best anchorage for reverse Akers */
function pickRepresentativePosteriors(allPosteriors: FDI[]): FDI[] {
	const right = allPosteriors.filter((f) => {
		const q = Math.floor(f / 10);
		return q === 1 || q === 4;
	});
	const left = allPosteriors.filter((f) => {
		const q = Math.floor(f / 10);
		return q === 2 || q === 3;
	});
	// "Most posterior" = highest tooth number within quadrant
	const mostPosterior = (fdis: FDI[]) =>
		fdis.length === 0 ? null : (fdis.slice().sort((a, b) => (b % 10) - (a % 10))[0] as FDI);
	const out: FDI[] = [];
	const r = mostPosterior(right);
	const l = mostPosterior(left);
	if (r) out.push(r);
	if (l) out.push(l);
	return out;
}

function determineTier(
	missingCount: number,
	canineLossCount: number,
	zoneSize: number
): EstheticTier {
	if (missingCount === 0) return 'no-anterior-loss';
	if (canineLossCount >= 2) return 'canine-to-canine';
	if (missingCount === 1) return 'single-tooth';
	if (missingCount <= 3) return 'two-three-teeth';
	if (missingCount === 4) return 'four-teeth';
	return 'five-plus-teeth';
}

function strategyFor(
	tier: EstheticTier,
	estheticAbutments: FDI[],
	posteriorAbutments: FDI[],
	canineLossCount: number
): { primaryStrategy: string; alternatives: string[] } {
	switch (tier) {
		case 'no-anterior-loss':
			return {
				primaryStrategy: 'ไม่มีฟันหน้าที่หาย — ไม่มี esthetic concern ที่ต้องการ design พิเศษ',
				alternatives: []
			};

		case 'single-tooth':
			return {
				primaryStrategy:
					'ฟันหน้าหาย 1 ซี่ — **Fixed prosthesis แนะนำก่อน RPD**: (1) Implant — ดีที่สุด conservative, (2) Maryland bridge — minimally invasive, (3) Conventional bridge — ถ้า abutments ต้องบูรณะอยู่แล้ว',
				alternatives: [
					'ถ้าจำเป็นต้องทำ RPD: ใช้ **rotational path (Jackson)** — anterior pickup, ไม่มี clasp มองเห็น',
					estheticAbutments.includes(13 as FDI) || estheticAbutments.includes(23 as FDI) || estheticAbutments.includes(33 as FDI) || estheticAbutments.includes(43 as FDI)
						? 'หรือ I-bar บน canine ข้าง saddle (ถ้ามี undercut + vestibule พอ) — บางจากด้าน gingival approach'
						: 'หรือ wrought-wire arm บน abutment หน้า (flex ปกปิดได้ดีกว่า cast)',
					'หลีกเลี่ยง Akers/cast circumferential ที่ canine/incisor — visible เกิน'
				]
			};

		case 'two-three-teeth':
			return {
				primaryStrategy:
					posteriorAbutments.length
						? `Reverse Akers บน ${posteriorAbutments.join(' และ ')} (engage mesial undercut) + **lingual rest** บน anterior abutments (ไม่ใส่ clasp ที่ฟันหน้า) — esthetic ดี + indirect retention ได้พร้อมกัน`
						: 'ใช้ rotational path of insertion + cingulum rests บน canines/incisors',
				alternatives: [
					'I-bar (Roach) บน canine ถัด saddle — gingivally-approaching, มองจากด้านหน้ายาก',
					'Continuous bar lingual (Kennedy bar) — splint ฟันหน้าทั้งหมด + ทำหน้าที่ indirect retainer',
					'Extracoronal precision attachment บน abutment — esthetic ดีที่สุด แต่ต้องทำ crown',
					'Rotational path of insertion (Jackson) — ทางเลือกที่ดีที่สุดถ้า anterior undercut ≥ 0.5 mm'
				]
			};

		case 'four-teeth':
			return {
				primaryStrategy:
					'ฟันหน้าหาย 4 ซี่ — **borderline tooth-supported** เริ่มต้องการ tissue support เพิ่ม: broader major connector + stress-releasing element + indirect retainer ที่ posterior ทั้ง 2 ข้าง',
				alternatives: [
					'Reverse Akers หรือ embrasure clasp บน molar/premolar 2 ข้าง',
					'Maxillary: AP palatal strap หรือ palatal plate (ครอบคลุมมากขึ้นเพื่อ stress distribution)',
					'Mandibular: lingual plate (ครอบคลุม cingulum + ทำ indirect retainer)',
					'Continuous bar lingual กับ anterior abutment ที่เหลือ',
					'พิจารณา rotational path ถ้าเป็น patient esthetic-critical'
				]
			};

		case 'five-plus-teeth':
			return {
				primaryStrategy:
					'ฟันหน้าหาย ≥ 5 ซี่ — **ไม่ใช่ tooth-supported อีกต่อไป**: ใช้หลักการ tissue-supported similar ต่อ Class I distal extension; saddle อาศัย ridge support เป็นหลัก',
				alternatives: [
					'**RPI clasp** บน premolar ที่ใกล้ saddle ที่สุด — stress-releasing',
					'Maxillary: **palatal plate** (full coverage) สำหรับ tissue support',
					'Mandibular: lingual plate + cross-arch stabilization สูง',
					'Functional impression (altered cast) เพื่อ refine ridge contact',
					'พิจารณา **complete denture, overdenture** หรือ **implant-supported** เป็นทางเลือก'
				]
			};

		case 'canine-to-canine':
			return {
				primaryStrategy:
					'**Canine หายทั้งคู่** — เปลี่ยน paradigm ทั้งหมด: incisors เหลือไม่ใช่ abutment ที่ดี (รากเล็ก, C:R unfavorable). ใช้ premolar/molar เป็น primary abutments เท่านั้น',
				alternatives: [
					'หลีกเลี่ยงใช้ incisors เหลือเป็น direct retainer — ใช้แค่ rest support เบาๆ',
					'RPI clasp บน premolar ทั้ง 2 ข้าง',
					'Broader major connector (palatal plate / lingual plate)',
					'พิจารณา **implant ที่ canine position** เพื่อสร้าง cornerstone abutment',
					canineLossCount === 2 ? '(canine หายทั้ง 2 ข้าง — แนะนำ implant อย่างยิ่ง)' : ''
				].filter(Boolean)
			};
	}
}

export const ESTHETIC_REFERENCES = [REF_STEWART, REF_MCCRACKEN];
