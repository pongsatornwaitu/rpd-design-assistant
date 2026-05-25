import type { CaseData, FDI, SpacingType } from '$lib/types';
import { isAnterior, isCanine } from '$lib/types';
import { archTeeth, findMissingSpans, type ArchKey, type EdentulousSpan } from './spans';
import type { Classification } from './kennedy';
import type { Recommendation, Severity, Reference } from './rec-types';
import { analyzeFulcrum, type FulcrumAnalysis } from './fulcrum';
import { analyzeEsthetic, type EstheticAnalysis } from './esthetic';
import { analyzeInterarchSpace, type InterarchConcern } from './interarch';
import { generateMouthPrep, type MouthPrepItem } from './mouthPrep';
import { applyAntesLaw, type AnteAnalysis } from './ante';
import { patientConsiderations } from './patient';
import { analyzePathOfInsertion, type PathOfInsertionAnalysis } from './pathOfInsertion';
import { specializedClaspRecs } from './claspVariations';
import { analyzeCrossArch, type CrossArchAnalysis } from './crossArch';

export type { Recommendation, Severity };

const SPACING_LABELS: Record<Exclude<SpacingType, 'none'>, string> = {
	diastema: 'Diastema',
	drift: 'Drift/Tipping',
	foodTrap: 'Food trap',
	esthetic: 'Esthetic gap'
};

export interface AbutmentRole {
	fdi: FDI;
	role: 'terminal-distal' | 'bounded' | 'terminal-anterior';
	span: EdentulousSpan;
}

export interface ArchAnalysis {
	arch: ArchKey;
	classification: Classification;
	spans: EdentulousSpan[];
	abutments: FDI[];
	abutmentRoles: AbutmentRole[];
	majorConnector: Recommendation;
	clasps: Recommendation[];
	specializedClasps: Recommendation[];
	rests: Recommendation[];
	indirectRetention: Recommendation[];
	estheticStrategy: Recommendation[];
	interarchConcerns: Recommendation[];
	crossArch: Recommendation[];
	pathOfInsertion: Recommendation[];
	mouthPrep: MouthPrepItem[];
	anteCheck: AnteAnalysis;
	concerns: Recommendation[];
	fulcrum: FulcrumAnalysis;
	esthetic: EstheticAnalysis;
	poi: PathOfInsertionAnalysis;
	crossArchAnalysis: CrossArchAnalysis;
}

// ---- References ----
const REF_MCCRACKEN_MAJ: Reference = {
	source: "McCracken's RPD (Carr & Brown, 13th ed., 2016)",
	page: 'Ch. 5 — Major and Minor Connectors'
};
const REF_MCCRACKEN_DR: Reference = {
	source: "McCracken's RPD (Carr & Brown, 13th ed., 2016)",
	page: 'Ch. 6-7 Direct Retainers; Ch. 11 Distal Extension'
};
const REF_MCCRACKEN_IR: Reference = {
	source: "McCracken's RPD (Carr & Brown, 13th ed., 2016)",
	page: 'Ch. 8 — Indirect Retainers'
};
const REF_KROL: Reference = {
	source: 'Krol AJ. Clasp design for extension-base removable partial dentures.',
	page: 'J Prosthet Dent. 1973;29(4):408-415'
};
const REF_PHOENIX: Reference = {
	source: "Phoenix RD, Cagna DR, DeFreest CF. Stewart's Clinical RPD (4th ed., 2008)",
	page: 'Ch. 6 — Direct Retainer Selection; Ch. 7 — Indirect retention'
};
const REF_APPLEGATE: Reference = {
	source: 'Applegate OC. Essentials of Removable Partial Denture Prosthesis (3rd ed.)',
	page: 'Stress-releasing design'
};

// ---- Helpers ----

function uniqueAbutments(spans: EdentulousSpan[]): FDI[] {
	const set = new Set<FDI>();
	for (const s of spans) {
		if (s.rightAbutment) set.add(s.rightAbutment);
		if (s.leftAbutment) set.add(s.leftAbutment);
	}
	return [...set].sort((a, b) => a - b);
}

function rolesOf(spans: EdentulousSpan[]): AbutmentRole[] {
	const roles: AbutmentRole[] = [];
	for (const span of spans) {
		if (span.bounded) {
			if (span.rightAbutment) roles.push({ fdi: span.rightAbutment, role: 'bounded', span });
			if (span.leftAbutment) roles.push({ fdi: span.leftAbutment, role: 'bounded', span });
		} else if (span.distalRight) {
			if (span.leftAbutment)
				roles.push({ fdi: span.leftAbutment, role: 'terminal-distal', span });
		} else if (span.distalLeft) {
			if (span.rightAbutment)
				roles.push({ fdi: span.rightAbutment, role: 'terminal-distal', span });
		} else {
			if (span.rightAbutment)
				roles.push({ fdi: span.rightAbutment, role: 'terminal-anterior', span });
			if (span.leftAbutment)
				roles.push({ fdi: span.leftAbutment, role: 'terminal-anterior', span });
		}
	}
	const priority = { 'terminal-distal': 0, 'terminal-anterior': 1, bounded: 2 } as const;
	const byFdi = new Map<FDI, AbutmentRole>();
	for (const r of roles) {
		const ex = byFdi.get(r.fdi);
		if (!ex || priority[r.role] < priority[ex.role]) byFdi.set(r.fdi, r);
	}
	return [...byFdi.values()].sort((a, b) => a.fdi - b.fdi);
}

// ---- Major Connector (uses interarch + vestibule) ----

function majorConnectorRec(
	arch: ArchKey,
	cls: Classification['className'],
	data: CaseData
): Recommendation {
	if (arch === 'maxilla') {
		if (cls === 'I' || cls === 'II') {
			return {
				title: 'Maxillary major connector: AP Palatal Strap หรือ Palatal Plate',
				detail:
					'Distal extension ต้องการ rigidity สูงเพื่อกระจาย load — AP palatal strap ถ้าฟันหน้า/หลังเหลือพอ; palatal plate ถ้าฟันเหลือน้อย/load สูง (เพิ่ม tissue support)',
				severity: 'info',
				references: [REF_MCCRACKEN_MAJ]
			};
		}
		if (cls === 'IV') {
			return {
				title: 'Maxillary major connector: AP Palatal Strap (กว้าง)',
				detail:
					'Class IV: ครอบคลุม anterior ridge เพื่อรองรับ esthetic anterior pontic; U-shaped (horseshoe) เฉพาะกรณี large torus เท่านั้น (rigidity ต่ำ)',
				severity: 'warn',
				references: [REF_MCCRACKEN_MAJ]
			};
		}
		return {
			title: 'Maxillary major connector: Single Palatal Strap',
			detail:
				'Bounded edentulous (Class III) — single palatal strap rigidity เพียงพอ ใส่สบาย ไม่ปกปิด palate มาก',
			severity: 'good',
			references: [REF_MCCRACKEN_MAJ]
		};
	}

	// mandible — vestibule + posterior interarch space
	const teeth = archTeeth(arch, true).filter((f) => data.teeth[f].status === 'present');
	const minVest = teeth.length
		? Math.min(...teeth.map((f) => data.teeth[f].vestibuleMm))
		: 10;
	const minPost = Math.min(data.interarch.posteriorRightMm, data.interarch.posteriorLeftMm);

	if (minVest < 8 || minPost < 4) {
		const reason: string[] = [];
		if (minVest < 8) reason.push(`vestibule ${minVest} mm < 8 mm`);
		if (minPost < 4) reason.push(`posterior interarch ${minPost} mm < 4 mm`);
		return {
			title: `Mandibular major connector: Lingual Plate (${reason.join(', ')})`,
			detail: `Lingual bar ต้องการ vestibule depth ≥ 8 mm (3 mm gingival clearance + 4 mm bar + 1 mm margin) และ vertical space เพียงพอ ไม่ดัน opposing — ในเคสนี้ใช้ lingual plate (cingulum coverage) แทน`,
			severity: 'warn',
			references: [REF_MCCRACKEN_MAJ]
		};
	}

	if (cls === 'I' || cls === 'II') {
		return {
			title: `Mandibular major connector: Lingual Bar (vestibule ${minVest} mm)`,
			detail:
				'Distal extension: lingual bar rigidity ดี + ไม่กระทบ gingiva ของฟันหน้า; rigidity สำคัญใน Class I/II เพราะ leverage จาก extension',
			severity: 'good',
			references: [REF_MCCRACKEN_MAJ]
		};
	}

	return {
		title: `Mandibular major connector: Lingual Bar (vestibule ${minVest} mm)`,
		detail: 'Bounded edentulous — lingual bar เพียงพอ tooth-borne support',
		severity: 'good',
		references: [REF_MCCRACKEN_MAJ]
	};
}

// ---- Clasp selection ----

function describeUndercut(mm: number): string {
	if (mm === 0) return 'ไม่มี undercut';
	if (mm < 0.25) return `${mm} mm — ไม่เพียงพอ (< 0.25 mm)`;
	if (mm <= 0.5) return `${mm} mm — ใช้กับ cast clasp ได้`;
	if (mm <= 0.75) return `${mm} mm — ลึก ต้องใช้ wrought-wire`;
	return `${mm} mm — ลึกมาก ต้องปรับ contour`;
}

const RECIPROCATION_NOTE =
	'ต้องมี reciprocation: reciprocal arm หรือ minor connector ฝั่งตรงข้าม retentive arm — ป้องกัน lateral force ทำให้ฟัน drift';

function claspForBoundedAbutment(fdi: FDI, undercutMm: number, inEstheticZone: boolean): Recommendation {
	const estheticNote = inEstheticZone
		? '\n• ⚠ อยู่ใน esthetic zone — พิจารณา: rotational path, reverse Akers จากด้าน lingual, หรือ lingual cingulum-based design'
		: '';

	if (undercutMm === 0) {
		return {
			title: `ฟัน ${fdi}: ⚠ ไม่มี undercut — ต้อง modify`,
			detail: `สร้าง undercut ด้วย composite restoration หรือ surveyed crown ก่อนวาง clasp${estheticNote}\n• ${RECIPROCATION_NOTE}`,
			severity: 'warn',
			references: [REF_PHOENIX]
		};
	}
	if (undercutMm < 0.25) {
		return {
			title: `ฟัน ${fdi}: ⚠ Undercut ตื้น (${undercutMm} mm)`,
			detail: `ตื้น < 0.25 mm — retention ไม่พอ; enhance undercut (composite) หรือใช้ wrought-wire bar clasp${estheticNote}\n• ${RECIPROCATION_NOTE}`,
			severity: 'warn',
			references: [REF_PHOENIX]
		};
	}
	if (undercutMm > 0.5) {
		return {
			title: `ฟัน ${fdi}: Wrought-wire circumferential (undercut ${undercutMm} mm)`,
			detail: `Undercut > 0.5 mm — wrought-wire (18 gauge) flex ได้กว่า cast; cast จะ permanent deform${estheticNote}\n• ${RECIPROCATION_NOTE}`,
			severity: 'warn',
			references: [REF_PHOENIX, REF_MCCRACKEN_DR]
		};
	}
	return {
		title: `ฟัน ${fdi}: Cast Circumferential (Akers) clasp`,
		detail: `Bounded abutment, undercut ${undercutMm} mm — Akers retentive arm engage 0.25 mm undercut; occlusal rest บน fossa ใกล้ saddle${estheticNote}\n• ${RECIPROCATION_NOTE}`,
		severity: 'good',
		references: [REF_MCCRACKEN_DR, REF_PHOENIX]
	};
}

function claspForDistalTerminalAbutment(
	fdi: FDI,
	undercutMm: number,
	tipped: boolean
): Recommendation {
	if (tipped) {
		return {
			title: `ฟัน ${fdi}: RPA clasp + uprighting ก่อน`,
			detail: `Terminal abutment tipped — แก้ tipping ด้วย orthodontic uprighting หรือ surveyed crown ก่อน; clasp ใช้ RPA: Mesial rest + Proximal plate + Akers retentive arm (เมื่อ undercut ไม่เหมาะกับ I-bar)\n• ${RECIPROCATION_NOTE} (proximal plate ทำหน้าที่ reciprocation)`,
			severity: 'warn',
			references: [REF_KROL, REF_MCCRACKEN_DR]
		};
	}
	if (undercutMm > 0.5) {
		return {
			title: `ฟัน ${fdi}: RPI หรือ Combination (wrought-wire + cast)`,
			detail: `Terminal abutment + undercut ${undercutMm} mm — RPI: gingivally-approaching I-bar engage 0.25 mm M-B undercut (ไม่ engage full depth) หรือ combination clasp (wrought-wire retentive arm flex ได้)\n• Proximal plate = reciprocation`,
			severity: 'info',
			references: [REF_KROL, REF_PHOENIX, REF_MCCRACKEN_DR]
		};
	}
	if (undercutMm < 0.25) {
		return {
			title: `ฟัน ${fdi}: RPI — เพิ่ม undercut ก่อน`,
			detail:
				'Terminal abutment ต้องการ stress-releasing — สร้าง undercut M-B 0.25 mm ด้วย composite แล้วใช้ RPI: Mesial rest + Distal proximal plate + I-bar\n• Proximal plate = reciprocation',
			severity: 'warn',
			references: [REF_KROL]
		};
	}
	return {
		title: `ฟัน ${fdi}: RPI clasp (Krol) — stress-releasing`,
		detail: `Terminal abutment ของ distal extension — RPI: (1) **Mesial** occlusal Rest (fulcrum เคลื่อน mesial, vertical load หมุน I-bar ออกจาก undercut ไม่ถ่าย torque), (2) Distal **Proximal plate** ติด guide plane (ทำหน้าที่ reciprocation), (3) Gingivally-approaching **I-bar** engage 0.25 mm M-B undercut. หลีกเลี่ยง Akers/circumferential ที่ไม่มี stress-release`,
		severity: 'good',
		references: [REF_KROL, REF_MCCRACKEN_DR, REF_APPLEGATE]
	};
}

function claspForAnteriorTerminal(fdi: FDI, undercutMm: number): Recommendation {
	return {
		title: `ฟัน ${fdi}: Wrought-wire หรือ rotational path (anterior abutment)`,
		detail: `Anterior abutment esthetic-critical — wrought-wire (flex + ปกปิด); ${describeUndercut(undercutMm)}; พิจารณา rotational path (Jackson) เพื่อหลีกเลี่ยง visible clasp\n• ${RECIPROCATION_NOTE}`,
		severity: 'info',
		references: [REF_PHOENIX]
	};
}

function claspRecsFor(roles: AbutmentRole[], data: CaseData): Recommendation[] {
	const recs: Recommendation[] = [];
	for (const r of roles) {
		const s = data.teeth[r.fdi];

		if (s.prognosis === 'poor' || s.crownRoot === 'unfavorable') {
			recs.push({
				title: `ฟัน ${r.fdi}: ⚠ ไม่เหมาะเป็น abutment — พิจารณาถอน`,
				detail: `${s.prognosis === 'poor' ? 'Prognosis แย่' : ''}${s.prognosis === 'poor' && s.crownRoot === 'unfavorable' ? ' + ' : ''}${s.crownRoot === 'unfavorable' ? 'C:R ratio แย่' : ''} — ไม่ควรรับ load จาก clasp`,
				severity: 'danger',
				references: [REF_MCCRACKEN_DR]
			});
			continue;
		}

		const inEsthetic = isAnterior(r.fdi);
		let rec: Recommendation;
		if (r.role === 'terminal-distal') {
			rec = claspForDistalTerminalAbutment(r.fdi, s.undercutDepthMm, s.tipped);
		} else if (r.role === 'terminal-anterior') {
			rec = claspForAnteriorTerminal(r.fdi, s.undercutDepthMm);
		} else {
			rec = claspForBoundedAbutment(r.fdi, s.undercutDepthMm, inEsthetic);
		}

		const notes: string[] = [];
		if (s.guidePlane === 'absent') notes.push('ไม่มี guide plane — ต้องสร้างขณะ mouth prep');
		if (s.guidePlane === 'partial') notes.push('Guide plane ไม่สมบูรณ์ — refine');
		if (s.prognosis === 'questionable') notes.push('Prognosis น่าสงสัย — monitor');
		if (s.crownRoot === 'borderline') notes.push('C:R borderline — splint ถ้าทำได้');
		if (s.mobility === 'grade1') notes.push('Mobility grade 1 — splint advisable');
		if (s.surveyedCrown) notes.push('แนะนำ surveyed crown ก่อนใช้');

		if (notes.length) rec = { ...rec, detail: `${rec.detail}\n• ${notes.join('\n• ')}` };
		recs.push(rec);
	}
	return recs;
}

// ---- Rests ----

/** Determine rest type based on tooth position */
function restTypeFor(fdi: FDI): { type: 'occlusal' | 'cingulum' | 'incisal'; note: string } {
	if (isCanine(fdi)) {
		return {
			type: 'cingulum',
			note: 'Cingulum rest บน lingual cingulum (ลึก 1-1.5 mm, V-shaped); ถ้า cingulum ตื้น ต้อง composite addition หรือ surveyed crown'
		};
	}
	const mod = fdi % 10;
	if (mod === 1 || mod === 2) {
		// incisor
		return {
			type: 'incisal',
			note: 'Incisal rest (last resort) — รบกวน esthetic, ใช้เมื่อไม่มี canine ให้ใช้; ขูด V-notch บน incisal edge 2 mm กว้าง × 1.5 mm ลึก'
		};
	}
	return {
		type: 'occlusal',
		note: 'Occlusal rest seat: 1/3 mesiodistal × 1/2 buccolingual × 1-1.5 mm depth, saucer-shaped, smooth round edges'
	};
}

function restRecsFor(roles: AbutmentRole[], spans: EdentulousSpan[], data: CaseData): Recommendation[] {
	const recs: Recommendation[] = [];
	const seenSpans = new Set<EdentulousSpan>();

	for (const r of roles) {
		const restInfo = restTypeFor(r.fdi);
		if (r.role === 'terminal-distal' && !seenSpans.has(r.span)) {
			seenSpans.add(r.span);
			recs.push({
				title: `ฟัน ${r.fdi} (distal extension abutment): Mesial ${restInfo.type} rest`,
				detail:
					`Distal extension — rest ที่ mesial (ไม่ใช่ distal): fulcrum line เคลื่อน mesial → vertical load จาก saddle หมุน I-bar ออกจาก undercut แทนถ่าย torque ลงฟัน (Krol RPI principle)\n• ${restInfo.note}`,
				severity: 'info',
				references: [REF_KROL, REF_MCCRACKEN_DR]
			});
		} else if (r.role === 'bounded' && !seenSpans.has(r.span)) {
			seenSpans.add(r.span);
			const restA = restTypeFor(r.span.rightAbutment as FDI);
			const restB = restTypeFor(r.span.leftAbutment as FDI);
			recs.push({
				title: `Span ${r.span.teeth.join(',')}: rests ทั้งสองข้างของ saddle`,
				detail:
					`Bounded saddle — rest 2 ด้าน: tooth-borne support, fulcrum line ระหว่างฟันสองข้าง\n• ${r.span.rightAbutment}: ${restA.type} rest — ${restA.note}\n• ${r.span.leftAbutment}: ${restB.type} rest — ${restB.note}`,
				severity: 'good',
				references: [REF_MCCRACKEN_DR]
			});
		}
	}

	// Crown lengthening flag — short clinical crown that may not accommodate rest seat
	const shortCrown = roles.filter((r) => {
		const s = data.teeth[r.fdi];
		return s.crownRoot === 'unfavorable' && !isCanine(r.fdi);
	});
	if (shortCrown.length) {
		recs.push({
			title: `Crown lengthening ที่อาจจำเป็น: ${shortCrown.map((r) => r.fdi).join(', ')}`,
			detail:
				'C:R ratio แย่ + crown สั้น → rest seat 1-1.5 mm depth อาจ expose pulp; พิจารณา surgical crown lengthening, surveyed crown, หรือเลือก abutment อื่น',
			severity: 'warn',
			references: [REF_MCCRACKEN_DR]
		});
	}

	return recs;
}

// ---- Indirect retention ----

function indirectRetentionRecs(fulcrum: FulcrumAnalysis): Recommendation[] {
	if (fulcrum.type === 'none' || fulcrum.type === 'bounded') return [];
	if (!fulcrum.indirectRetainerPositions.length) {
		return [
			{
				title: 'Indirect retainer: ไม่มี abutment ที่เหมาะสม',
				detail: `${fulcrum.reason} — แต่ในเคสนี้ไม่มีฟันที่เหลือในตำแหน่งที่เหมาะสม; พิจารณา continuous bar หรือ broader major connector แทน`,
				severity: 'warn',
				references: [REF_MCCRACKEN_IR]
			}
		];
	}
	const fdiList = fulcrum.indirectRetainerPositions.join(', ');
	return [
		{
			title: `Indirect retainer: auxiliary rest บนฟัน ${fdiList}`,
			detail: `${fulcrum.reason}\n• วาง auxiliary rest (occlusal หรือ cingulum) ที่ตั้งฉากกับ fulcrum line ห่างที่สุด (perpendicular distance สูงสุด = torque resistance สูงสุด)\n• Fulcrum line ผ่าน: ${fulcrum.definingTeeth.join(', ')}\n• Rest seat ต้องลึกพอ (≥ 1 mm) เพื่อ rigid contact เมื่อ saddle เคลื่อน`,
			severity: 'info',
			references: [REF_MCCRACKEN_IR, REF_PHOENIX]
		}
	];
}

// ---- Esthetic strategy ----

function estheticRecs(esthetic: EstheticAnalysis): Recommendation[] {
	if (esthetic.tier === 'no-anterior-loss') return [];
	const out: Recommendation[] = [
		{
			title: `Esthetic strategy: ฟันหน้าหาย ${esthetic.missingAnteriorCount} ซี่${esthetic.missingCanines.length ? ` (canine หาย ${esthetic.missingCanines.length} ข้าง)` : ''}`,
			detail: esthetic.primaryStrategy,
			severity: esthetic.tier === 'five-plus-teeth' || esthetic.tier === 'canine-to-canine' ? 'warn' : 'info',
			references: esthetic.references
		}
	];
	if (esthetic.alternatives.length) {
		out.push({
			title: 'Esthetic — Alternative designs ที่พิจารณาได้',
			detail: esthetic.alternatives.map((a) => `• ${a}`).join('\n'),
			severity: 'info',
			references: esthetic.references
		});
	}
	return out;
}

// ---- Interarch concerns ----

function interarchRecs(concerns: InterarchConcern[]): Recommendation[] {
	if (!concerns.length) return [];
	return concerns
		.filter((c) => c.severity !== 'info' || c.region !== 'anterior')
		.map((c) => ({
			title: `Interarch (${labelForRegion(c.region)}): ${c.finding}`,
			detail: c.action + (c.affectedTeeth?.length ? `\nฟันที่เกี่ยวข้อง: ${c.affectedTeeth.join(', ')}` : ''),
			severity: c.severity,
			references: [
				{ source: "McCracken's RPD (13th ed.)", page: 'Ch.16 — Mouth Preparation' },
				{ source: "Phoenix RD. Stewart's RPD (4th ed.)", page: 'Ch.4 — Diagnosis' }
			]
		}));
}

function labelForRegion(r: InterarchConcern['region']): string {
	switch (r) {
		case 'anterior':
			return 'ฟันหน้า';
		case 'posterior-right':
			return 'ฟันหลังขวา';
		case 'posterior-left':
			return 'ฟันหลังซ้าย';
		case 'localized':
			return 'supraerupted';
	}
}

// ---- Spacing & concerns ----

function spacingConcernsFor(arch: ArchKey, data: CaseData): Recommendation[] {
	const teeth = archTeeth(arch, true);
	const items: { fdi: FDI; type: SpacingType; side: 'mesial' | 'distal' }[] = [];
	for (const fdi of teeth) {
		const s = data.teeth[fdi];
		if (s.status !== 'present') continue;
		if (s.spacingMesial !== 'none') items.push({ fdi, type: s.spacingMesial, side: 'mesial' });
		if (s.spacingDistal !== 'none') items.push({ fdi, type: s.spacingDistal, side: 'distal' });
	}
	if (!items.length) return [];
	const grouped = items.map(
		(i) => `${SPACING_LABELS[i.type as Exclude<SpacingType, 'none'>]} ที่ ${i.fdi} (${i.side})`
	);
	return [
		{
			title: `Interdental spacing (${items.length} จุด)`,
			detail: `${grouped.join(', ')} — บันทึกใน design sheet; ไม่นับเป็น Kennedy modification (Applegate's rule) แต่อาจต้องจัดการ esthetics, food trap, drift ก่อนทำ RPD`,
			severity: 'warn',
			references: [REF_APPLEGATE]
		}
	];
}

function concernsFor(abutments: FDI[], data: CaseData): Recommendation[] {
	const list: Recommendation[] = [];
	const poor = abutments.filter((f) => data.teeth[f].prognosis === 'poor');
	if (poor.length) {
		list.push({
			title: `Abutment prognosis ไม่ดี: ฟัน ${poor.join(', ')}`,
			detail: 'พิจารณาประเมินซ้ำหรือถอนก่อนสร้าง RPD เพื่อป้องกัน failure',
			severity: 'danger',
			references: []
		});
	}
	const tipped = abutments.filter((f) => data.teeth[f].tipped);
	if (tipped.length) {
		list.push({
			title: `ฟันล้ม: ${tipped.join(', ')}`,
			detail: 'พิจารณา orthodontic uprighting, crown lengthening, หรือ surveyed crown ก่อนใส่ RPD',
			severity: 'warn',
			references: []
		});
	}
	const mobile = abutments.filter((f) => {
		const m = data.teeth[f].mobility;
		return m === 'grade2' || m === 'grade3';
	});
	if (mobile.length) {
		list.push({
			title: `ฟัน mobile grade 2-3: ${mobile.join(', ')}`,
			detail: 'Periodontal therapy + splinting ก่อนใช้เป็น abutment; ถ้าไม่ดีขึ้นพิจารณาถอน',
			severity: 'danger',
			references: []
		});
	}
	return list;
}

// ---- Entry point ----

export function analyzeArch(
	arch: ArchKey,
	data: CaseData,
	classification: Classification,
	includeThirdMolars = false
): ArchAnalysis {
	const spans = findMissingSpans(arch, data, includeThirdMolars);
	const abutments = uniqueAbutments(spans);
	const abutmentRoles = rolesOf(spans);
	const fulcrum = analyzeFulcrum(arch, data, spans, classification.className);
	const esthetic = analyzeEsthetic(arch, data, spans, abutments);
	const interarchConcerns = analyzeInterarchSpace(arch, data);
	const mouthPrep = generateMouthPrep(arch, data, abutments);
	const isToothSupported = classification.className === 'III' || classification.className === 'IV';
	const anteCheck = applyAntesLaw(data, spans, abutments, isToothSupported);
	const patientWarnings = patientConsiderations(data);
	const poi = analyzePathOfInsertion(arch, data, abutments, esthetic);
	const specialized = specializedClaspRecs(arch, data, spans, abutments);
	const crossArch = analyzeCrossArch(arch, data, spans, classification.className);

	const baseConcerns = [
		...concernsFor(abutments, data),
		...spacingConcernsFor(arch, data),
		...patientWarnings
	];

	if (anteCheck.violated) {
		baseConcerns.unshift({
			title: `Ante's Law violation: ${anteCheck.finding}`,
			detail: anteCheck.implication,
			severity: 'danger',
			references: [
				{ source: 'Ante IH. The fundamental principles of abutments.', page: 'Mich State Dent Soc Bull. 1926;8:14-23' },
				{ source: 'Jepsen A. Root surface area measurements.', page: 'Acta Odontol Scand. 1963;21:35-46' }
			]
		});
	}

	// Fulcrum line length warning
	const fulcrumWarnings = fulcrumLengthWarnings(fulcrum, arch);

	return {
		arch,
		classification,
		spans,
		abutments,
		abutmentRoles,
		majorConnector: majorConnectorRec(arch, classification.className, data),
		clasps: claspRecsFor(abutmentRoles, data),
		specializedClasps: specialized,
		rests: restRecsFor(abutmentRoles, spans, data),
		indirectRetention: [...indirectRetentionRecs(fulcrum), ...fulcrumWarnings],
		estheticStrategy: estheticRecs(esthetic),
		interarchConcerns: interarchRecs(interarchConcerns),
		crossArch: crossArch.recommendations,
		pathOfInsertion: poiRecs(poi),
		mouthPrep,
		anteCheck,
		concerns: baseConcerns,
		fulcrum,
		esthetic,
		poi,
		crossArchAnalysis: crossArch
	};
}

function poiRecs(poi: PathOfInsertionAnalysis): Recommendation[] {
	const sev = poi.recommendedPath === 'rotational' ? 'good' : 'info';
	return [
		{
			title: `Path of Insertion: ${labelPath(poi.recommendedPath)}`,
			detail: poi.rationale + (poi.feasibilityReason ? `\n• ${poi.feasibilityReason}` : ''),
			severity: sev as Severity,
			references: poi.references
		}
	];
}

function labelPath(p: PathOfInsertionAnalysis['recommendedPath']): string {
	switch (p) {
		case 'rotational':
			return 'Rotational (Jackson) — สำหรับ esthetic';
		case 'tilted-anterior':
			return 'Tilted anterior';
		case 'tilted-posterior':
			return 'Tilted posterior';
		case 'single-vertical':
			return 'Single vertical (standard)';
	}
}

function fulcrumLengthWarnings(fulcrum: FulcrumAnalysis, _arch: ArchKey): Recommendation[] {
	if (fulcrum.definingTeeth.length < 2) return [];
	const out: Recommendation[] = [];

	// Short fulcrum line: both defining teeth in same quadrant (within 4 FDI of each other)
	if (fulcrum.definingTeeth.length === 2) {
		const [a, b] = fulcrum.definingTeeth;
		const sameQuad = Math.floor(a / 10) === Math.floor(b / 10);
		if (sameQuad) {
			out.push({
				title: `⚠ Fulcrum line สั้น — both rests ใน quadrant เดียวกัน (${a}, ${b})`,
				detail:
					'Fulcrum line สั้น → torque resistance ลดลง; ฟันปลอมจะ rotate ง่ายขึ้น. พิจารณา: (1) ขยาย fulcrum line ด้วย rest เพิ่ม cross-arch (2) ใช้ rigid major connector + indirect retainer ห่างจาก fulcrum',
				severity: 'warn',
				references: [
					{ source: "McCracken's RPD (13th ed.)", page: 'Ch. 8 — Indirect retainers' }
				]
			});
		}
	}

	return out;
}
