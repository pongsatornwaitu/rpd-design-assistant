import type { CaseData, FDI, SpacingType } from '$lib/types';
import { archTeeth, findMissingSpans, type ArchKey, type EdentulousSpan } from './spans';
import type { Classification, Reference } from './kennedy';

const SPACING_LABELS: Record<Exclude<SpacingType, 'none'>, string> = {
	diastema: 'Diastema',
	drift: 'Drift/Tipping',
	foodTrap: 'Food trap',
	esthetic: 'Esthetic gap'
};

export type Severity = 'info' | 'good' | 'warn' | 'danger';

export interface Recommendation {
	title: string;
	detail: string;
	severity: Severity;
	references: Reference[];
}

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
	rests: Recommendation[];
	concerns: Recommendation[];
}

// ---- References (accurate citations) ----
const REF_MCCRACKEN_MAJ: Reference = {
	source: "McCracken's Removable Partial Prosthodontics (Carr & Brown, 13th ed., 2016)",
	page: 'Ch. 5 — Major and Minor Connectors'
};
const REF_MCCRACKEN_DR: Reference = {
	source: "McCracken's Removable Partial Prosthodontics (Carr & Brown, 13th ed., 2016)",
	page: 'Ch. 6-7 — Direct Retainers; Ch. 11 — Distal Extension'
};
const REF_KROL: Reference = {
	source: 'Krol AJ. Clasp design for extension-base removable partial dentures.',
	page: 'J Prosthet Dent. 1973;29(4):408-415 (original RPI description)'
};
const REF_PHOENIX: Reference = {
	source: "Phoenix RD, Cagna DR, DeFreest CF. Stewart's Clinical Removable Partial Prosthodontics (4th ed., 2008)",
	page: 'Ch. 6 — Direct Retainer Selection'
};
const REF_APPLEGATE: Reference = {
	source: 'Applegate OC. Essentials of Removable Partial Denture Prosthesis (3rd ed., W.B. Saunders)',
	page: 'Stress-releasing clasp design'
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
			// extends from index 0, abutment is on left/mesial side
			if (span.leftAbutment)
				roles.push({ fdi: span.leftAbutment, role: 'terminal-distal', span });
		} else if (span.distalLeft) {
			// extends to last index, abutment on right side
			if (span.rightAbutment)
				roles.push({ fdi: span.rightAbutment, role: 'terminal-distal', span });
		} else {
			// solitary anterior extension (rare)
			if (span.rightAbutment)
				roles.push({ fdi: span.rightAbutment, role: 'terminal-anterior', span });
			if (span.leftAbutment)
				roles.push({ fdi: span.leftAbutment, role: 'terminal-anterior', span });
		}
	}
	// merge — keep most stressful role per fdi (terminal-distal > terminal-anterior > bounded)
	const priority = { 'terminal-distal': 0, 'terminal-anterior': 1, bounded: 2 } as const;
	const byFdi = new Map<FDI, AbutmentRole>();
	for (const r of roles) {
		const ex = byFdi.get(r.fdi);
		if (!ex || priority[r.role] < priority[ex.role]) byFdi.set(r.fdi, r);
	}
	return [...byFdi.values()].sort((a, b) => a.fdi - b.fdi);
}

// ---- Major Connector ----

function majorConnectorRec(
	arch: ArchKey,
	cls: Classification['className'],
	data: CaseData
): Recommendation {
	if (arch === 'maxilla') {
		if (cls === 'I' || cls === 'II') {
			return {
				title: 'Maxillary major connector: Anterior-Posterior Palatal Strap หรือ Palatal Plate',
				detail:
					'Distal extension RPD ต้องการ rigidity สูงเพื่อกระจาย load — ใช้ AP palatal strap ถ้าฟันหน้า/หลังเหลือพอ; ถ้าฟันเหลือน้อยหรือ load สูง ใช้ palatal plate (full coverage) เพื่อ tissue-borne support',
				severity: 'info',
				references: [REF_MCCRACKEN_MAJ]
			};
		}
		if (cls === 'IV') {
			return {
				title: 'Maxillary major connector: Anterior-Posterior Palatal Strap (กว้าง)',
				detail:
					'Class IV ต้องครอบคลุม anterior ridge เพื่อรองรับ esthetic anterior pontic — AP palatal strap ให้ rigidity ขณะที่ U-shaped (horseshoe) มี flex สูง ใช้เฉพาะกรณีมี torus ขนาดใหญ่',
				severity: 'warn',
				references: [REF_MCCRACKEN_MAJ]
			};
		}
		return {
			title: 'Maxillary major connector: Single Palatal Strap',
			detail:
				'Bounded edentulous (Class III) — single palatal strap ให้ rigidity เพียงพอสำหรับ tooth-supported RPD ใส่สบาย ไม่ปกปิด palate มากเกินไป',
			severity: 'good',
			references: [REF_MCCRACKEN_MAJ]
		};
	}

	// mandible — pick worst-case vestibule from abutments
	const teeth = archTeeth(arch, true).filter((f) => data.teeth[f].status === 'present');
	const minVest = teeth.length
		? Math.min(...teeth.map((f) => data.teeth[f].vestibuleMm))
		: 10;

	if (minVest < 8) {
		return {
			title: `Mandibular major connector: Lingual Plate (vestibule ${minVest} mm < 8 mm)`,
			detail: `Lingual bar ต้องการ vestibule depth ≥ 8 mm (rule of thumb: ≥3 mm gingival clearance + 4 mm bar height + 1 mm gingival margin). ในเคสนี้ ${minVest} mm — ใช้ lingual plate (cingulum bar coverage) แทน`,
			severity: 'warn',
			references: [REF_MCCRACKEN_MAJ]
		};
	}

	if (cls === 'I' || cls === 'II') {
		return {
			title: `Mandibular major connector: Lingual Bar (vestibule ${minVest} mm — เพียงพอ)`,
			detail:
				'Distal extension — lingual bar ให้ rigidity และไม่กระทบ gingiva ของฟันหน้า ในเคส Class I/II ต้องการ rigidity สูงเพราะมี leverage จาก distal extension',
			severity: 'good',
			references: [REF_MCCRACKEN_MAJ]
		};
	}

	return {
		title: `Mandibular major connector: Lingual Bar (vestibule ${minVest} mm — เพียงพอ)`,
		detail: 'Bounded edentulous — lingual bar เพียงพอ tooth-borne support',
		severity: 'good',
		references: [REF_MCCRACKEN_MAJ]
	};
}

// ---- Clasp selection ----

function describeUndercut(mm: number): string {
	if (mm === 0) return 'ไม่มี undercut';
	if (mm < 0.25) return `${mm} mm — ไม่เพียงพอ (< 0.25 mm)`;
	if (mm <= 0.5) return `${mm} mm — ใช้งานได้กับ cast clasp`;
	if (mm <= 0.75) return `${mm} mm — ลึก ต้องใช้ wrought-wire เพราะ cast จะ permanent deform`;
	return `${mm} mm — ลึกมาก ปรับ contour ก่อนใช้`;
}

function claspForBoundedAbutment(fdi: FDI, undercutMm: number): Recommendation {
	if (undercutMm === 0) {
		return {
			title: `ฟัน ${fdi}: ⚠ ไม่มี undercut — ต้อง modify`,
			detail:
				'ต้องสร้าง undercut ด้วย composite restoration หรือ surveyed crown ก่อนวาง clasp; พิจารณา height of contour ใหม่',
			severity: 'warn',
			references: [REF_PHOENIX]
		};
	}
	if (undercutMm < 0.25) {
		return {
			title: `ฟัน ${fdi}: ⚠ Undercut ตื้น (${undercutMm} mm)`,
			detail:
				'ตื้นกว่า 0.25 mm — retention อาจไม่เพียงพอ พิจารณา enhance undercut (composite) หรือใช้ wrought-wire bar clasp ในตำแหน่ง infrabulge',
			severity: 'warn',
			references: [REF_PHOENIX]
		};
	}
	if (undercutMm > 0.5) {
		return {
			title: `ฟัน ${fdi}: Wrought-wire circumferential clasp (undercut ${undercutMm} mm)`,
			detail:
				'Undercut > 0.5 mm — cast circumferential จะ permanent deform; wrought-wire (18 gauge) flex ได้ดีกว่า โอบฟันใน suprabulge → engage infrabulge 0.25 mm จาก undercut',
			severity: 'warn',
			references: [REF_PHOENIX, REF_MCCRACKEN_DR]
		};
	}
	return {
		title: `ฟัน ${fdi}: Cast Circumferential (Akers) clasp`,
		detail: `Bounded abutment, undercut ${undercutMm} mm — ใช้ Akers retentive arm engage 0.25 mm undercut ที่ buccal/lingual; reciprocal arm บน opposite side; occlusal rest บน fossa ใกล้ saddle`,
		severity: 'good',
		references: [REF_MCCRACKEN_DR, REF_PHOENIX]
	};
}

function claspForDistalTerminalAbutment(fdi: FDI, undercutMm: number, tipped: boolean): Recommendation {
	if (tipped) {
		return {
			title: `ฟัน ${fdi}: RPA (Rest-Proximal plate-Akers) clasp + uprighting first`,
			detail:
				'Terminal abutment ของ distal extension ที่ tipped — แก้ tipping ด้วย orthodontic uprighting หรือ surveyed crown ก่อน; clasp design ใช้ RPA: Mesial occlusal Rest + distal Proximal plate + Akers retentive arm (เมื่อ undercut ไม่เหมาะกับ I-bar)',
			severity: 'warn',
			references: [REF_KROL, REF_MCCRACKEN_DR]
		};
	}
	if (undercutMm > 0.5) {
		return {
			title: `ฟัน ${fdi}: RPI หรือ Combination clasp (wrought-wire retentive arm)`,
			detail: `Terminal abutment + undercut ลึก ${undercutMm} mm — ใช้ RPI (gingivally-approaching I-bar engage 0.25 mm M-B undercut) หรือ combination clasp ที่มี wrought-wire retentive arm; cast retentive arm ที่ undercut ลึกจะ permanent deform เมื่อ distal extension rotate posteriorly`,
			severity: 'info',
			references: [REF_KROL, REF_PHOENIX, REF_MCCRACKEN_DR]
		};
	}
	if (undercutMm < 0.25) {
		return {
			title: `ฟัน ${fdi}: RPI/RPA — ต้องเพิ่ม undercut ก่อน`,
			detail:
				'Terminal abutment ต้องการ stress-releasing design (RPI/RPA) แต่ undercut ปัจจุบันไม่พอ — สร้าง undercut ด้วย composite ที่ M-B (สำหรับ I-bar) แล้วใช้ RPI: Mesial rest + Distal proximal plate + I-bar',
			severity: 'warn',
			references: [REF_KROL]
		};
	}
	return {
		title: `ฟัน ${fdi}: RPI clasp (Krol) — stress-releasing`,
		detail: `Terminal abutment ของ distal extension — ใช้ RPI: (1) Mesial occlusal Rest เพื่อให้ fulcrum line อยู่ทาง mesial ลด torque เมื่อ saddle เคลื่อน, (2) distal Proximal plate ติด guide plane, (3) gingivally-approaching I-bar engage 0.25 mm M-B undercut. หลีกเลี่ยง Akers/circumferential clasp ที่ไม่มี stress-release เพราะจะแปลง vertical load เป็น torque บน abutment`,
		severity: 'good',
		references: [REF_KROL, REF_MCCRACKEN_DR, REF_APPLEGATE]
	};
}

function claspForAnteriorTerminal(fdi: FDI, undercutMm: number): Recommendation {
	return {
		title: `ฟัน ${fdi}: Wrought-wire retentive arm (anterior abutment)`,
		detail: `Anterior abutment — ใช้ wrought-wire เพื่อ esthetics และ flex; ${describeUndercut(undercutMm)}; พิจารณา rotational path of insertion (Jackson) เพื่อหลีกเลี่ยง visible clasp`,
		severity: 'info',
		references: [REF_PHOENIX]
	};
}

function claspRecsFor(roles: AbutmentRole[], data: CaseData): Recommendation[] {
	const recs: Recommendation[] = [];
	for (const r of roles) {
		const s = data.teeth[r.fdi];
		const u = s.undercutDepthMm;

		// hard-disqualify abutments with poor prognosis
		if (s.prognosis === 'poor' || s.crownRoot === 'unfavorable') {
			recs.push({
				title: `ฟัน ${r.fdi}: ⚠ พิจารณาถอน — ไม่เหมาะเป็น abutment`,
				detail: `${s.prognosis === 'poor' ? 'Prognosis แย่' : ''}${s.prognosis === 'poor' && s.crownRoot === 'unfavorable' ? ' และ ' : ''}${s.crownRoot === 'unfavorable' ? 'C:R ratio แย่' : ''} — ไม่ควรรับ load จาก clasp ปรึกษาเรื่องถอนหรือเปลี่ยน abutment`,
				severity: 'danger',
				references: [REF_MCCRACKEN_DR]
			});
			continue;
		}

		let rec: Recommendation;
		if (r.role === 'terminal-distal') {
			rec = claspForDistalTerminalAbutment(r.fdi, u, s.tipped);
		} else if (r.role === 'terminal-anterior') {
			rec = claspForAnteriorTerminal(r.fdi, u);
		} else {
			rec = claspForBoundedAbutment(r.fdi, u);
		}

		// append note about guide plane
		const notes: string[] = [];
		if (s.guidePlane === 'absent') notes.push('ไม่มี guide plane — ต้องสร้างขณะ mouth preparation');
		if (s.guidePlane === 'partial') notes.push('Guide plane ไม่สมบูรณ์ — adjust ก่อน final impression');
		if (s.prognosis === 'questionable') notes.push('Prognosis น่าสงสัย — monitor');
		if (s.crownRoot === 'borderline') notes.push('C:R borderline — splint กับฟันข้างเคียงถ้าทำได้');

		if (notes.length) rec = { ...rec, detail: `${rec.detail}\n• ${notes.join('\n• ')}` };
		recs.push(rec);
	}
	return recs;
}

// ---- Rests ----

function restRecsFor(roles: AbutmentRole[], spans: EdentulousSpan[]): Recommendation[] {
	const recs: Recommendation[] = [];
	const seenSpans = new Set<EdentulousSpan>();
	for (const r of roles) {
		if (r.role === 'terminal-distal' && !seenSpans.has(r.span)) {
			seenSpans.add(r.span);
			recs.push({
				title: `Span ${r.span.teeth.join(',')}: Mesial occlusal rest บนฟัน ${r.fdi}`,
				detail:
					'Distal extension — วาง rest ที่ mesial fossa ของ terminal abutment (ไม่ใช่ distal fossa) เพื่อให้ fulcrum line เคลื่อนไปข้าง mesial เมื่อ saddle เคลื่อนตัวลง vertical load จะหมุน clasp arm ออกจาก undercut แทนที่จะถ่าย torque ลงฟัน — เป็นหลักการสำคัญของ RPI design',
				severity: 'info',
				references: [REF_KROL, REF_MCCRACKEN_DR]
			});
		} else if (r.role === 'bounded' && !seenSpans.has(r.span)) {
			seenSpans.add(r.span);
			recs.push({
				title: `Span ${r.span.teeth.join(',')}: Occlusal rests ทั้ง mesial+distal`,
				detail: 'Bounded saddle — วาง rest ทั้งสองด้านของช่องว่าง เพื่อ tooth-borne support, fulcrum line อยู่ระหว่างฟันสองข้างของ saddle',
				severity: 'good',
				references: [REF_MCCRACKEN_DR]
			});
		}
	}
	// fallback: spans not covered
	for (const span of spans) {
		if (seenSpans.has(span)) continue;
		if (span.rightAbutment || span.leftAbutment) {
			recs.push({
				title: `Span ${span.teeth.join(',')}: ประเมิน rest seat`,
				detail: 'พิจารณาตำแหน่ง rest seat ตาม fulcrum line ของเคส',
				severity: 'info',
				references: [REF_MCCRACKEN_DR]
			});
		}
	}
	return recs;
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
			detail: 'ฟันเหล่านี้มี prognosis แย่ — ควรประเมินซ้ำหรือพิจารณาถอนก่อนสร้าง RPD เพื่อป้องกัน failure',
			severity: 'danger',
			references: []
		});
	}
	const tipped = abutments.filter((f) => data.teeth[f].tipped);
	if (tipped.length) {
		list.push({
			title: `ฟันล้ม: ${tipped.join(', ')}`,
			detail: 'ฟันล้มควรพิจารณา orthodontic uprighting, crown lengthening หรือ surveyed crown ก่อนใส่ RPD',
			severity: 'warn',
			references: []
		});
	}
	const needAlt = abutments.filter((f) => data.teeth[f].requiresAlteration);
	if (needAlt.length) {
		list.push({
			title: `ต้อง tooth alteration: ${needAlt.join(', ')}`,
			detail: 'ฟันเหล่านี้ต้อง mouth preparation (rest seat, guide plane, contour adjustment) ก่อน final impression',
			severity: 'info',
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
	return {
		arch,
		classification,
		spans,
		abutments,
		abutmentRoles,
		majorConnector: majorConnectorRec(arch, classification.className, data),
		clasps: claspRecsFor(abutmentRoles, data),
		rests: restRecsFor(abutmentRoles, spans),
		concerns: [...concernsFor(abutments, data), ...spacingConcernsFor(arch, data)]
	};
}
