export type Arch = 'maxillary' | 'mandibular';

export type FDI =
	| 18 | 17 | 16 | 15 | 14 | 13 | 12 | 11
	| 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28
	| 48 | 47 | 46 | 45 | 44 | 43 | 42 | 41
	| 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38;

export type ToothStatus = 'present' | 'missing';

export type UndercutLocation = 'none' | 'mesial' | 'distal' | 'buccal' | 'lingual';
export type GuidePlane = 'absent' | 'partial' | 'adequate';
export type Prognosis = 'good' | 'questionable' | 'poor';
export type CrownRoot = 'favorable' | 'borderline' | 'unfavorable';
export type SpacingType = 'none' | 'diastema' | 'drift' | 'foodTrap' | 'esthetic';
export type Mobility = 'none' | 'grade1' | 'grade2' | 'grade3';

export interface ToothSurvey {
	status: ToothStatus;
	undercutLocation: UndercutLocation;
	/** Undercut depth in mm. Common gauge values: 0.25 (0.01"), 0.5 (0.02"), 0.75 (0.03"). */
	undercutDepthMm: number;
	guidePlane: GuidePlane;
	/** Floor of mouth / sulcus depth in mm from gingival margin. */
	vestibuleMm: number;
	prognosis: Prognosis;
	crownRoot: CrownRoot;
	mobility: Mobility;
	requiresAlteration: boolean;
	tipped: boolean;
	/** Antagonist tooth supraerupted; restorative space reduced */
	supraerupted: boolean;
	/** Would benefit from surveyed crown before use as abutment */
	surveyedCrown: boolean;
	spacingMesial: SpacingType;
	spacingDistal: SpacingType;
	notes: string;
}

export type OralHygiene = 'good' | 'fair' | 'poor';
export type OcclusionType = 'normal' | 'deepBite' | 'openBite' | 'crossBite' | 'edge';
export type SkeletalClass = 'class1' | 'class2' | 'class3';
export type SalivaryFlow = 'normal' | 'reduced' | 'xerostomia';
export type TmjStatus = 'normal' | 'clicking' | 'pain' | 'limited';
export type TongueSize = 'small' | 'normal' | 'large';
export type FrenumAttachment = 'low' | 'normal' | 'high';
export type MetalAllergy = 'none' | 'nickel' | 'cobalt-chromium' | 'multiple';

export interface PatientFactors {
	bruxism: boolean;
	oralHygiene: OralHygiene;
	occlusion: OcclusionType;
	/** Smile line shows gingival margin (high smile) — esthetic priority */
	highSmileLine: boolean;
	maxillaryTorus: boolean;
	mandibularTori: boolean;
	age: number;
	salivaryFlow: SalivaryFlow;
	tmjStatus: TmjStatus;
	skeletalClass: SkeletalClass;
	tongueSize: TongueSize;
	frenumAttachment: FrenumAttachment;
	metalAllergy: MetalAllergy;
	notes: string;
}

export interface InterarchSpace {
	/** Vertical space at anterior (incisal) region in mm */
	anteriorMm: number;
	/** Vertical space at right posterior (first molar region) in mm */
	posteriorRightMm: number;
	/** Vertical space at left posterior (first molar region) in mm */
	posteriorLeftMm: number;
}

export interface CaseMeta {
	id: string;
	title: string;
	patient: string;
	createdAt: string;
	updatedAt: string;
}

export interface CaseData {
	schemaVersion: 2;
	meta: CaseMeta;
	teeth: Record<FDI, ToothSurvey>;
	patientFactors: PatientFactors;
	interarch: InterarchSpace;
}

export const ALL_FDI: FDI[] = [
	18, 17, 16, 15, 14, 13, 12, 11,
	21, 22, 23, 24, 25, 26, 27, 28,
	48, 47, 46, 45, 44, 43, 42, 41,
	31, 32, 33, 34, 35, 36, 37, 38
];

export const MAXILLARY_FDI: FDI[] = [
	18, 17, 16, 15, 14, 13, 12, 11,
	21, 22, 23, 24, 25, 26, 27, 28
];

export const MANDIBULAR_FDI: FDI[] = [
	48, 47, 46, 45, 44, 43, 42, 41,
	31, 32, 33, 34, 35, 36, 37, 38
];

/** Anterior esthetic zone — canine-to-canine (FDI 13-23, 33-43) */
export const ESTHETIC_ZONE: ReadonlySet<FDI> = new Set([13, 12, 11, 21, 22, 23, 33, 32, 31, 41, 42, 43]);

/** Canines (key abutments) */
export const CANINES: ReadonlySet<FDI> = new Set([13, 23, 33, 43]);

export function archOf(fdi: FDI): Arch {
	const q = Math.floor(fdi / 10);
	return q === 1 || q === 2 ? 'maxillary' : 'mandibular';
}

export function isAnterior(fdi: FDI): boolean {
	return ESTHETIC_ZONE.has(fdi);
}

export function isCanine(fdi: FDI): boolean {
	return CANINES.has(fdi);
}

/** Approximate root surface area in mm² (Jepsen 1963) — used for Ante's Law */
export const ROOT_SURFACE_AREA: Record<FDI, number> = {
	// Maxillary
	18: 350, 17: 431, 16: 433, 15: 220, 14: 234, 13: 273, 12: 179, 11: 234,
	21: 234, 22: 179, 23: 273, 24: 234, 25: 220, 26: 433, 27: 431, 28: 350,
	// Mandibular
	48: 350, 47: 426, 46: 431, 45: 207, 44: 180, 43: 268, 42: 168, 41: 154,
	31: 154, 32: 168, 33: 268, 34: 180, 35: 207, 36: 431, 37: 426, 38: 350
};

export function defaultSurvey(): ToothSurvey {
	return {
		status: 'present',
		undercutLocation: 'none',
		undercutDepthMm: 0,
		guidePlane: 'adequate',
		vestibuleMm: 10,
		prognosis: 'good',
		crownRoot: 'favorable',
		mobility: 'none',
		requiresAlteration: false,
		tipped: false,
		supraerupted: false,
		surveyedCrown: false,
		spacingMesial: 'none',
		spacingDistal: 'none',
		notes: ''
	};
}

export function defaultPatient(): PatientFactors {
	return {
		bruxism: false,
		oralHygiene: 'good',
		occlusion: 'normal',
		highSmileLine: false,
		maxillaryTorus: false,
		mandibularTori: false,
		age: 50,
		salivaryFlow: 'normal',
		tmjStatus: 'normal',
		skeletalClass: 'class1',
		tongueSize: 'normal',
		frenumAttachment: 'normal',
		metalAllergy: 'none',
		notes: ''
	};
}

export function defaultInterarch(): InterarchSpace {
	return {
		anteriorMm: 10,
		posteriorRightMm: 7,
		posteriorLeftMm: 7
	};
}

export function emptyCase(): CaseData {
	const teeth = {} as Record<FDI, ToothSurvey>;
	for (const fdi of ALL_FDI) teeth[fdi] = defaultSurvey();
	const now = new Date().toISOString();
	return {
		schemaVersion: 2,
		meta: {
			id: crypto.randomUUID(),
			title: 'เคสใหม่',
			patient: '',
			createdAt: now,
			updatedAt: now
		},
		teeth,
		patientFactors: defaultPatient(),
		interarch: defaultInterarch()
	};
}
