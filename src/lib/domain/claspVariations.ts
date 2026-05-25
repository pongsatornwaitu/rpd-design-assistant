import type { CaseData, FDI } from '$lib/types';
import { isAnterior, isCanine } from '$lib/types';
import { archTeeth, type ArchKey, type EdentulousSpan } from './spans';
import type { Recommendation } from './rec-types';

const REF_MCCRACKEN: { source: string; page?: string } = {
	source: "McCracken's RPD (Carr & Brown, 13th ed., 2016)",
	page: 'Ch. 6-7 — Direct Retainers'
};
const REF_PHOENIX: { source: string; page?: string } = {
	source: "Phoenix RD. Stewart's Clinical RPD (4th ed.)",
	page: 'Ch. 6 — Specialized clasp designs'
};

/**
 * Detect specialized clasp opportunities based on abutment configuration.
 * Returns ADDITIONAL recommendations to supplement basic clasp recs.
 */
export function specializedClaspRecs(
	arch: ArchKey,
	data: CaseData,
	spans: EdentulousSpan[],
	abutments: FDI[]
): Recommendation[] {
	const recs: Recommendation[] = [];
	const archAll = archTeeth(arch, true);

	// ---- Ring clasp: tipped molar abutment with no posterior abutment ----
	for (const fdi of abutments) {
		const s = data.teeth[fdi];
		const mod = fdi % 10;
		if (mod < 6 || !s.tipped || s.status !== 'present') continue;

		// Is there NO posterior abutment / present tooth distal to this one?
		const idx = archAll.indexOf(fdi);
		const distalSide = isOnRightOfMidline(fdi)
			? archAll.slice(0, idx)
			: archAll.slice(idx + 1);
		const hasPosteriorNeighbor = distalSide.some(
			(f) => data.teeth[f].status === 'present' && f % 10 >= 6
		);

		if (!hasPosteriorNeighbor) {
			recs.push({
				title: `ฟัน ${fdi}: Ring clasp (tipped lone-standing molar)`,
				detail: `Ring clasp ครอบ ~3/4 รอบฟัน — เริ่มจาก rest seat บน mesio-occlusal สู่ distal → buccal → distobuccal undercut, มี auxiliary rest บน mesiolingual fossa. ใช้เมื่อ molar tipped + ไม่มี abutment ด้าน distal — ring ช่วยกระจาย bracing 360° ลด torque\n• ต้อง strut + auxiliary rest เพื่อรักษา rigidity ของ ring`,
				severity: 'info',
				references: [REF_MCCRACKEN, REF_PHOENIX]
			});
		}
	}

	// ---- Back-action clasp: lone-standing premolar abutment ----
	for (const fdi of abutments) {
		const mod = fdi % 10;
		if (mod < 4 || mod > 5) continue;
		if (data.teeth[fdi].status !== 'present') continue;

		const idx = archAll.indexOf(fdi);
		const neighbors = [archAll[idx - 1], archAll[idx + 1]].filter(Boolean);
		const neighborsMissing = neighbors.every(
			(f) => f !== undefined && data.teeth[f].status === 'missing'
		);

		if (neighborsMissing && neighbors.length === 2) {
			recs.push({
				title: `ฟัน ${fdi}: Back-action clasp (lone-standing premolar)`,
				detail:
					'Back-action: minor connector มาจาก distal saddle → ไปขึ้น lingual rest บน mesiolingual fossa → arm กลับไป engage distal undercut. เหมาะกับ premolar ที่ยืนเดี่ยว (saddle ทั้งสองด้าน) — สร้าง bracing แทน reciprocation จาก fossa\n• พิจารณาเทียบกับ embrasure clasp ถ้ามี abutment คู่',
				severity: 'info',
				references: [REF_MCCRACKEN, REF_PHOENIX]
			});
		}
	}

	// ---- Embrasure (double Akers) clasp ----
	// Indication: 2 adjacent teeth (BOTH present, BOTH abutments), no saddle between them
	// Used in Class II/III when one side needs cross-arch retention
	const abutmentSet = new Set(abutments);
	for (let i = 0; i < archAll.length - 1; i++) {
		const a = archAll[i];
		const b = archAll[i + 1];
		if (!abutmentSet.has(a) || !abutmentSet.has(b)) continue;
		if (data.teeth[a].status !== 'present' || data.teeth[b].status !== 'present') continue;
		// Skip if they're abutments of the SAME span (saddle between them — that's normal bounded)
		const sameSpan = spans.some(
			(s) =>
				(s.rightAbutment === a && s.leftAbutment === b) ||
				(s.rightAbutment === b && s.leftAbutment === a)
		);
		if (sameSpan) continue;
		// Skip anterior teeth (esthetic concern — embrasure clasp shows)
		if (isAnterior(a) || isAnterior(b)) continue;

		recs.push({
			title: `Embrasure clasp ที่ ${a}-${b} (double Akers)`,
			detail: `Embrasure clasp: clasp 2 ตัวประกบกันใน embrasure space ระหว่างฟัน — ฐาน metal เชื่อม occlusal rest บนทั้ง 2 ฟัน + retentive arm แต่ละข้าง engage undercut คนละทิศ. ใช้สำหรับ cross-arch stabilization ใน Class II/III; ต้องเตรียม occlusal rest ทั้งสองข้างของ embrasure + interproximal reduction เล็กน้อย`,
			severity: 'info',
			references: [REF_MCCRACKEN, REF_PHOENIX]
		});
		break; // one suggestion is enough
	}

	// ---- Continuous bar / Kennedy bar ----
	// Indication: distal extension + multiple anterior teeth present needing splinting + indirect retention
	const anteriorPresent = archAll.filter(
		(f) => isAnterior(f) && data.teeth[f].status === 'present'
	);
	const hasDistalExtension = spans.some((s) => s.distalRight || s.distalLeft);
	if (anteriorPresent.length >= 4 && hasDistalExtension) {
		recs.push({
			title: `Continuous bar (Kennedy bar) — splint ฟันหน้า ${anteriorPresent.length} ซี่`,
			detail: `Continuous bar: thin metal bar lingual ข้าม cingulum ของ canine-to-canine — splint ฟันหน้าทั้งหมด + ทำหน้าที่ indirect retainer สำหรับ distal extension. หนา ~2 mm × 1 mm, อยู่เหนือ cingulum, ไม่กดเหงือก. มาคู่กับ lingual bar ปกติ\n• ห้ามใช้กับ deep bite (อาจชน ฟันบนตอน occlusion)`,
			severity: 'info',
			references: [REF_MCCRACKEN]
		});
	}

	// ---- Reverse circumferential (Reverse Akers) ----
	// Indication: undercut on side TOWARD the saddle (mesial undercut on posterior abutment of distal extension,
	// or for esthetic anti-tipping in anterior bounded cases)
	for (const fdi of abutments) {
		const s = data.teeth[fdi];
		if (s.status !== 'present') continue;
		const mod = fdi % 10;

		// Posterior abutment of distal extension with mesial undercut
		const isPosteriorOfDistal = mod >= 4 && spans.some((sp) => {
			if (!sp.distalRight && !sp.distalLeft) return false;
			const ab = sp.distalRight ? sp.leftAbutment : sp.rightAbutment;
			return ab === fdi;
		});
		const hasMesialUndercut = s.undercutLocation === 'mesial' && s.undercutDepthMm >= 0.25;

		if (isPosteriorOfDistal && hasMesialUndercut && !s.tipped) {
			recs.push({
				title: `ฟัน ${fdi}: Reverse circumferential clasp (mesial undercut)`,
				detail: `Reverse Akers: retentive arm มาจาก distal สู่ mesial engage mesial undercut — กลับทิศจาก Akers ปกติ. ใช้เมื่อ undercut อยู่ฝั่ง saddle (mesial of posterior abutment ของ distal extension). หลีกเลี่ยงถ้า abutment tipped (load direction ไม่เหมาะ)\n• ตรงข้ามต้องมี reciprocal arm จาก suprabulge distal`,
				severity: 'info',
				references: [REF_MCCRACKEN, REF_PHOENIX]
			});
		}
	}

	// ---- T-bar / Y-bar (Roach bar variants) ----
	// Indication: I-bar contraindicated due to high frenum or shallow vestibule, but bar still preferred for esthetic
	for (const fdi of abutments) {
		const s = data.teeth[fdi];
		if (s.status !== 'present') continue;
		const isTerminalDistal = spans.some((sp) => {
			if (!sp.distalRight && !sp.distalLeft) return false;
			const ab = sp.distalRight ? sp.leftAbutment : sp.rightAbutment;
			return ab === fdi;
		});
		if (!isTerminalDistal) continue;
		// If vestibule borderline (5-7 mm), I-bar may be uncomfortable → T-bar
		if (s.vestibuleMm >= 5 && s.vestibuleMm < 8) {
			recs.push({
				title: `ฟัน ${fdi}: T-bar หรือ Y-bar (Roach variant) — vestibule ${s.vestibuleMm} mm`,
				detail: `Vestibule ปานกลาง (5-7 mm) → I-bar อาจดัน lip; ใช้ T-bar (เพิ่ม retentive lug horizontal) หรือ Y-bar (mesiodistal extension จาก approach arm) แทน. ทั้งคู่ engage undercut similarly แต่ approach arm กว้างกว่า รั้งได้มั่นคงกว่า\n• Suprabulge minor connector ทำหน้าที่ reciprocation`,
				severity: 'info',
				references: [REF_PHOENIX]
			});
		}
	}

	return recs;
}

function isOnRightOfMidline(fdi: FDI): boolean {
	const q = Math.floor(fdi / 10);
	return q === 1 || q === 4;
}
