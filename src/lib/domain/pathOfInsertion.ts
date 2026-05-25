import type { CaseData, FDI } from '$lib/types';
import { isAnterior } from '$lib/types';
import { archTeeth, type ArchKey } from './spans';
import type { EstheticAnalysis } from './esthetic';

export type PathType = 'single-vertical' | 'rotational' | 'tilted-anterior' | 'tilted-posterior';

export interface PathOfInsertionAnalysis {
	arch: ArchKey;
	recommendedPath: PathType;
	rationale: string;
	feasibilityForRotational: 'feasible' | 'borderline' | 'not-feasible';
	feasibilityReason: string;
	references: { source: string; page?: string }[];
}

const REF_JACKSON: { source: string; page?: string } = {
	source: 'Jackson TR. The application of rotational paths to removable partial dentures.',
	page: 'J Prosthet Dent. 1980;44(3):302-309'
};
const REF_MCCRACKEN_POI: { source: string; page?: string } = {
	source: "McCracken's RPD (Carr & Brown, 13th ed.)",
	page: 'Ch. 12 — Surveying / Path of placement'
};

/**
 * Determine recommended path of insertion.
 *
 * Single vertical path: standard for most cases — undercuts engaged simultaneously on insertion
 *
 * Rotational path (Jackson 1980): two-stage insertion engaging anterior undercuts during rotation
 * — useful for anterior bounded saddles to avoid visible anterior clasps. Requires:
 *   • Anterior abutments with adequate undercut (≥0.5mm) on the retentive side
 *   • Rigid minor connectors that engage these undercuts during rotation
 *   • Path of placement different from path of removal
 *
 * Tilted anterior/posterior: alter cast tilt during surveying to expose useful undercuts;
 * may be needed when undercuts are awkwardly placed.
 */
export function analyzePathOfInsertion(
	arch: ArchKey,
	data: CaseData,
	abutments: FDI[],
	esthetic: EstheticAnalysis
): PathOfInsertionAnalysis {
	// Rotational path candidacy:
	// 1. Anterior bounded saddle present (Class IV or anterior Mod)
	// 2. Posterior abutments to lock the prosthesis after rotation
	// 3. Anterior abutments with adequate undercut for engagement
	const anteriorAbutments = abutments.filter((f) => isAnterior(f));
	// Posterior support for rotational path = present posterior teeth (not necessarily abutments)
	const archAll = archTeeth(arch, true);
	const posteriorSupport = archAll.filter(
		(f) => !isAnterior(f) && data.teeth[f].status === 'present'
	);
	const isAnteriorSaddle =
		esthetic.tier !== 'no-anterior-loss' && esthetic.tier !== 'five-plus-teeth';

	const anteriorWithGoodUndercut = anteriorAbutments.filter(
		(f) => data.teeth[f].undercutDepthMm >= 0.5
	);

	if (isAnteriorSaddle && anteriorAbutments.length && posteriorSupport.length >= 1) {
		if (anteriorWithGoodUndercut.length === anteriorAbutments.length) {
			return {
				arch,
				recommendedPath: 'rotational',
				rationale: `Rotational path of insertion (Jackson 1980): anterior bounded saddle + ${anteriorAbutments.length} anterior abutment(s) ที่มี undercut ≥ 0.5 mm + posterior abutment สำหรับ lock. Path 1: insert anterior segment engaging anterior undercut. Path 2: rotate posterior segment seat. หลีกเลี่ยง visible anterior clasps ได้ทั้งหมด`,
				feasibilityForRotational: 'feasible',
				feasibilityReason: `Anterior abutments ${anteriorAbutments.join(',')} ทุกซี่มี undercut ≥ 0.5 mm`,
				references: [REF_JACKSON, REF_MCCRACKEN_POI]
			};
		}
		if (anteriorWithGoodUndercut.length >= 1) {
			return {
				arch,
				recommendedPath: 'single-vertical',
				rationale:
					'Single vertical path — rotational path ทำได้ borderline: บางซี่ undercut ไม่พอ ต้องเพิ่ม undercut (composite) ก่อน หรือใช้ single path กับ esthetic clasp alternatives (reverse Akers posterior, I-bar)',
				feasibilityForRotational: 'borderline',
				feasibilityReason: `Only ${anteriorWithGoodUndercut.length}/${anteriorAbutments.length} anterior abutments มี undercut ≥ 0.5 mm`,
				references: [REF_JACKSON, REF_MCCRACKEN_POI]
			};
		}
		return {
			arch,
			recommendedPath: 'single-vertical',
			rationale:
				'Single vertical path — rotational path ไม่เหมาะ: anterior abutments ไม่มี undercut เพียงพอ; ถ้าต้องการ esthetic ใช้ reverse Akers/I-bar/attachment แทน',
			feasibilityForRotational: 'not-feasible',
			feasibilityReason: 'Anterior abutments undercut < 0.5 mm',
			references: [REF_JACKSON, REF_MCCRACKEN_POI]
		};
	}

	// Check for tilted path: undercuts predominantly on one side
	const undercutDirections = abutments
		.map((f) => data.teeth[f].undercutLocation)
		.filter((u) => u !== 'none');
	const mesialCount = undercutDirections.filter((d) => d === 'mesial').length;
	const distalCount = undercutDirections.filter((d) => d === 'distal').length;

	if (mesialCount > distalCount * 2 && mesialCount >= 2) {
		return {
			arch,
			recommendedPath: 'tilted-anterior',
			rationale: `Tilted anterior path — undercut ส่วนใหญ่อยู่ mesial (${mesialCount} ซี่); ปรับ tilt cast ไปทาง anterior 5-10° ขณะ surveying เพื่อให้ height of contour เปิดให้ retentive arm เข้าได้ง่าย; insert tray จาก posterior ก่อน`,
			feasibilityForRotational: 'not-feasible',
			feasibilityReason: 'Undercut pattern เอื้อต่อ tilted path มากกว่า rotational',
			references: [REF_MCCRACKEN_POI]
		};
	}
	if (distalCount > mesialCount * 2 && distalCount >= 2) {
		return {
			arch,
			recommendedPath: 'tilted-posterior',
			rationale: `Tilted posterior path — undercut ส่วนใหญ่อยู่ distal (${distalCount} ซี่); tilt cast ไปทาง posterior 5-10°; insert จาก anterior ก่อน`,
			feasibilityForRotational: 'not-feasible',
			feasibilityReason: 'Undercut pattern เอื้อต่อ tilted path',
			references: [REF_MCCRACKEN_POI]
		};
	}

	return {
		arch,
		recommendedPath: 'single-vertical',
		rationale:
			'Single vertical path (standard) — undercuts distributed สมดุล; insert ตรงๆ vertical; guide planes parallel ทุกซี่; retentive arms engage simultaneously',
		feasibilityForRotational: 'not-feasible',
		feasibilityReason: 'ไม่มี anterior bounded saddle ที่ต้อง esthetic-driven path',
		references: [REF_MCCRACKEN_POI]
	};
}
