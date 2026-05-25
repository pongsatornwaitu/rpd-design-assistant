import type { CaseData } from '$lib/types';
import type { Recommendation } from './rec-types';
import type { EstheticAnalysis } from './esthetic';

const REF_MCCRACKEN_MAT: { source: string; page?: string } = {
	source: "McCracken's RPD (Carr & Brown, 13th ed.)",
	page: 'Ch. 19 — Materials and laboratory'
};
const REF_PHOENIX_MAT: { source: string; page?: string } = {
	source: "Phoenix RD. Stewart's Clinical RPD (4th ed.)",
	page: 'Ch. 14 — Framework materials'
};

export interface MaterialChoice {
	framework: Recommendation;
	artificialTeeth: Recommendation;
	denture: Recommendation;
}

/**
 * Material selection covers three layers:
 *  1. Framework — Co-Cr (standard), Ti, CAD/CAM Co-Cr, Valplast (flexible), PEEK
 *  2. Artificial teeth — Acrylic resin, composite, porcelain
 *  3. Denture base — Heat-cured PMMA, hybrid (CAD-CAM puck), thermoplastic
 */
export function selectMaterials(
	data: CaseData,
	esthetic: EstheticAnalysis,
	isToothSupported: boolean
): MaterialChoice {
	const p = data.patientFactors;

	// ---- Framework ----
	let framework: Recommendation;
	if (p.metalAllergy === 'multiple') {
		framework = {
			title: 'Framework: CAD-CAM PEEK หรือ Valplast (metal allergy)',
			detail:
				'Multiple metal allergy → ใช้ non-metallic: (1) PEEK (poly-ether-ether-ketone) CAD-CAM milled — rigid, biocompatible, esthetic; ราคาสูง; flex 100x ของ Co-Cr; (2) Valplast (nylon thermoplastic) — flexible, esthetic แต่ rigidity ต่ำ ไม่เหมาะ distal extension. แนะนำ PEEK ถ้ามีงบ',
			severity: 'warn',
			references: [REF_MCCRACKEN_MAT]
		};
	} else if (p.metalAllergy === 'cobalt-chromium') {
		framework = {
			title: 'Framework: Commercially pure Ti หรือ Ti-6Al-4V',
			detail:
				'Co-Cr allergy → ใช้ Ti grade 2-4 หรือ Ti-6Al-4V; biocompatible, light (50% ของ Co-Cr), corrosion resistant; แต่ machining/casting ยากกว่า, lab cost สูง 30-50%; rigidity ใกล้ Co-Cr',
			severity: 'info',
			references: [REF_MCCRACKEN_MAT, REF_PHOENIX_MAT]
		};
	} else if (p.metalAllergy === 'nickel') {
		framework = {
			title: 'Framework: Nickel-free Co-Cr หรือ Ti',
			detail:
				'Nickel allergy → Ni-free Co-Cr (Wironit Extra-hard, BEGO Wironium), Ti, หรือ PEEK; ไม่ใช้ Co-Cr ที่มี Ni > 0.2% (most Ni-containing alloys are < 1% but symptomatic patients react)',
			severity: 'info',
			references: [REF_MCCRACKEN_MAT]
		};
	} else if (p.bruxism && esthetic.tier === 'no-anterior-loss') {
		framework = {
			title: 'Framework: Co-Cr cast (rigid, heavy-duty)',
			detail:
				'Bruxism + posterior-only: Co-Cr alloy cast framework เหมาะที่สุด — rigidity สูง, fatigue strength ดีกับ repeated loading; หลีกเลี่ยง flexible/Valplast (flex ทำให้ rest seat loosen); ความหนา minor connector ≥ 1.5 mm',
			severity: 'info',
			references: [REF_MCCRACKEN_MAT]
		};
	} else if (p.highSmileLine && esthetic.tier !== 'no-anterior-loss' && isToothSupported) {
		framework = {
			title: 'Framework: CAD-CAM Co-Cr (precision + thin esthetic)',
			detail:
				'High esthetic + tooth-supported: CAD-CAM milled Co-Cr ให้ precision สูง, สามารถ design clasp arm บางลง (0.9 mm vs 1.2 mm cast), เปลี่ยน emergence profile ให้กลมกลืน. ราคาสูงกว่า conventional cast 20-50%',
			severity: 'info',
			references: [REF_MCCRACKEN_MAT]
		};
	} else if (
		!p.bruxism &&
		esthetic.tier !== 'no-anterior-loss' &&
		esthetic.tier !== 'five-plus-teeth' &&
		isToothSupported
	) {
		framework = {
			title: 'Framework: Co-Cr (standard) หรือ Valplast option (esthetic)',
			detail:
				'Anterior bounded + ไม่ bruxism: Co-Cr cast เป็น default — rigid, durable. Valplast (thermoplastic nylon) เป็น esthetic option — pink/clear flexible flange ปกปิด clasp, แต่ rigid ต่ำกว่า ไม่เหมาะ extension cases; consider hybrid: cast metal framework + Valplast clear clasps ที่ anterior',
			severity: 'info',
			references: [REF_PHOENIX_MAT]
		};
	} else {
		framework = {
			title: 'Framework: Co-Cr cast alloy (standard)',
			detail:
				'Default choice — Co-Cr alloy (Vitallium, Wironit) cast framework: rigid, biocompatible, durable, cost-effective. Minor connector ≥ 1 mm, major connector ≥ 1-1.5 mm, clasp arm tapered 1.5 → 0.75 mm tip',
			severity: 'good',
			references: [REF_MCCRACKEN_MAT, REF_PHOENIX_MAT]
		};
	}

	// ---- Artificial teeth ----
	let artificialTeeth: Recommendation;
	if (p.bruxism) {
		artificialTeeth = {
			title: 'Artificial teeth: High-impact acrylic resin (avoid porcelain)',
			detail:
				'Bruxism: หลีกเลี่ยง porcelain (wear antagonist ฟันธรรมชาติเร็ว); ใช้ acrylic resin หรือ high-impact composite (IPN/cross-linked) ที่ทนแรง + ทดแทน wear ได้ง่าย; replace ทุก 5-7 ปี',
			severity: 'info',
			references: [REF_MCCRACKEN_MAT]
		};
	} else if (data.patientFactors.highSmileLine && esthetic.tier !== 'no-anterior-loss') {
		artificialTeeth = {
			title: 'Artificial teeth: Layered composite หรือ premium acrylic (esthetic)',
			detail:
				'High esthetic anterior: ใช้ layered composite teeth (Vitapan Excel, Phonares II) ที่มี translucency เหมือนฟันธรรมชาติ; sealed surface ลด stain; ราคาแพงกว่า acrylic ปกติแต่คุ้ม esthetic',
			severity: 'good',
			references: [REF_PHOENIX_MAT]
		};
	} else {
		artificialTeeth = {
			title: 'Artificial teeth: Cross-linked acrylic resin (standard)',
			detail:
				'Standard: cross-linked PMMA teeth (IPN, double cross-linked) — durable, color stable, easy to adjust; เหมาะกับฟันธรรมชาติเป็น antagonist; replace 5-10 ปี',
			severity: 'good',
			references: [REF_MCCRACKEN_MAT]
		};
	}

	// ---- Denture base ----
	let denture: Recommendation;
	if (p.metalAllergy === 'multiple') {
		denture = {
			title: 'Denture base: High-impact acrylic หรือ CAD-CAM puck',
			detail:
				'PMMA heat-cured ปกติเหมาะ; CAD-CAM milled puck (Ivoclar Ivotion, Pala CAD) ให้ density สูง porosity น้อย — adaptation ดี, allergic reaction ลด',
			severity: 'info',
			references: [REF_MCCRACKEN_MAT]
		};
	} else if (p.salivaryFlow === 'xerostomia' || p.salivaryFlow === 'reduced') {
		denture = {
			title: 'Denture base: Highly polished PMMA + soft liner option',
			detail:
				'Xerostomia → mucosa เปราะ → soft liner (Molloplast B) บน fitting surface ลด trauma; surface highly polished ลด plaque/candida; reline ทุก 6 เดือน',
			severity: 'info',
			references: [REF_MCCRACKEN_MAT]
		};
	} else {
		denture = {
			title: 'Denture base: Heat-cured PMMA (standard)',
			detail:
				'Conventional heat-cured PMMA: ความหนา ≥ 1.5 mm บน edentulous ridge; finish highly polished บน tissue surface (ลด plaque); border molded สำหรับ peripheral seal',
			severity: 'good',
			references: [REF_MCCRACKEN_MAT, REF_PHOENIX_MAT]
		};
	}

	return { framework, artificialTeeth, denture };
}
