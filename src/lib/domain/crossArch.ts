import type { CaseData, FDI } from '$lib/types';
import { archTeeth, type ArchKey, type EdentulousSpan } from './spans';
import type { Recommendation } from './rec-types';

const REF_MCCRACKEN: { source: string; page?: string } = {
	source: "McCracken's RPD (Carr & Brown, 13th ed.)",
	page: 'Ch. 11 — Class II design principles'
};
const REF_PHOENIX: { source: string; page?: string } = {
	source: "Phoenix RD. Stewart's Clinical RPD (4th ed.)",
	page: 'Ch. 7 — Class II / cross-arch'
};

export interface CrossArchAnalysis {
	required: boolean;
	side: 'right' | 'left' | null;
	contralateralAbutments: FDI[];
	rationale: string;
	recommendations: Recommendation[];
}

/**
 * Class II is fundamentally asymmetric: one side has distal extension (rotation risk),
 * the other side has natural teeth providing support. To stabilize the asymmetric loading,
 * the design must use the contralateral side as a counterbalance:
 *
 * 1. Rigid major connector to transfer forces across midline
 * 2. Indirect retainer on contralateral side, anterior to fulcrum
 * 3. Direct retainer on contralateral side (often as Akers on most posterior tooth)
 * 4. Possibly an additional rest on the contralateral side as third support point
 *
 * Without cross-arch stabilization, Class II RPDs torque the abutments and rotate
 * unilaterally during function.
 */
export function analyzeCrossArch(
	arch: ArchKey,
	data: CaseData,
	spans: EdentulousSpan[],
	className: 'I' | 'II' | 'III' | 'IV' | 'none'
): CrossArchAnalysis {
	if (className !== 'II') {
		return {
			required: false,
			side: null,
			contralateralAbutments: [],
			rationale: '',
			recommendations: []
		};
	}

	// Determine which side has the distal extension
	const distalSpan = spans.find((s) => s.distalRight || s.distalLeft);
	if (!distalSpan) {
		return {
			required: false,
			side: null,
			contralateralAbutments: [],
			rationale: '',
			recommendations: []
		};
	}

	// distalRight means span starts at index 0 of arch — that's the patient's right (for max) or right (for man)
	// Actually let's use the abutment FDI to determine side
	const terminalAbutment = distalSpan.leftAbutment ?? distalSpan.rightAbutment;
	if (!terminalAbutment) {
		return {
			required: false,
			side: null,
			contralateralAbutments: [],
			rationale: '',
			recommendations: []
		};
	}
	const quadrant = Math.floor(terminalAbutment / 10);
	const extensionSide: 'right' | 'left' = quadrant === 1 || quadrant === 4 ? 'right' : 'left';
	const contralateralSide = extensionSide === 'right' ? 'left' : 'right';

	// Find present teeth on contralateral side
	const archAll = archTeeth(arch, true);
	const contralateral = archAll.filter((f) => {
		const q = Math.floor(f / 10);
		const isRight = q === 1 || q === 4;
		const onContraSide = contralateralSide === 'right' ? isRight : !isRight;
		return onContraSide && data.teeth[f].status === 'present';
	});

	// Pick: a posterior tooth (molar/premolar) for direct retainer, a more anterior tooth for indirect
	const contraDirectCandidates = contralateral.filter((f) => f % 10 >= 4 && f % 10 <= 7);
	const contraIndirectCandidates = contralateral.filter((f) => f % 10 <= 4);

	const directOn = contraDirectCandidates.length
		? contraDirectCandidates[Math.floor(contraDirectCandidates.length / 2)]
		: contralateral[0];
	const indirectOn = contraIndirectCandidates.length
		? contraIndirectCandidates[contraIndirectCandidates.length - 1]
		: null;

	const recs: Recommendation[] = [];

	recs.push({
		title: `Cross-arch stabilization — Class II (extension ฝั่ง ${labelSide(extensionSide)})`,
		detail: `Class II asymmetric: ฝั่ง ${labelSide(extensionSide)} มี distal extension (rotation risk), ฝั่ง ${labelSide(contralateralSide)} มีฟันธรรมชาติเป็น support. ออกแบบต้องใช้ฝั่งตรงข้ามเป็น counterbalance: rigid major connector + direct retainer + indirect retainer + 3rd rest contralateral`,
		severity: 'info',
		references: [REF_MCCRACKEN, REF_PHOENIX]
	});

	if (directOn) {
		recs.push({
			title: `Direct retainer ฝั่งตรงข้าม: Akers บนฟัน ${directOn}`,
			detail: `วาง direct retainer (Akers cast circumferential) บน ${directOn} ฝั่ง ${labelSide(contralateralSide)} เพื่อรั้ง denture base ทั้งฝั่งและทำหน้าที่ counter retention เมื่อ ฝั่ง extension หมุน. Rest บน mesial fossa เพื่อให้ fulcrum line อยู่ระหว่าง 2 abutments หลัก`,
			severity: 'info',
			references: [REF_MCCRACKEN]
		});
	}

	if (indirectOn && indirectOn !== directOn) {
		recs.push({
			title: `Indirect retainer ฝั่งตรงข้าม: auxiliary rest บนฟัน ${indirectOn}`,
			detail: `Indirect retainer ที่ ${indirectOn} (mesial occlusal rest หรือ cingulum rest ถ้าเป็น canine) — anterior ต่อ fulcrum line, ห่างที่สุดเพื่อ torque resistance สูง. ป้องกัน rotation ของ distal extension base ฝั่ง ${labelSide(extensionSide)}`,
			severity: 'info',
			references: [REF_MCCRACKEN, REF_PHOENIX]
		});
	}

	recs.push({
		title: 'Rigid major connector — บังคับสำหรับ Class II',
		detail:
			'Major connector ต้อง rigid เพื่อถ่าย force ข้าม midline ไปฝั่งตรงข้าม. ห้ามใช้ wire connector / flexible. Maxilla: AP palatal strap, palatal plate, หรือ horseshoe (เฉพาะ torus). Mandible: lingual bar ที่หนา ≥ 4 mm หรือ lingual plate',
		severity: 'warn',
		references: [REF_MCCRACKEN]
	});

	return {
		required: true,
		side: extensionSide,
		contralateralAbutments: [directOn, indirectOn].filter(Boolean) as FDI[],
		rationale: `Class II — extension ฝั่ง ${labelSide(extensionSide)}: ต้อง stabilize ผ่านฝั่ง ${labelSide(contralateralSide)}`,
		recommendations: recs
	};
}

function labelSide(s: 'right' | 'left'): string {
	return s === 'right' ? 'ขวา' : 'ซ้าย';
}
