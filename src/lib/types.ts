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

export interface ToothSurvey {
	status: ToothStatus;
	undercutLocation: UndercutLocation;
	/** Undercut depth in mm. Common gauge values: 0.25 (0.01"), 0.5 (0.02"), 0.75 (0.03"). 0 = no undercut. */
	undercutDepthMm: number;
	guidePlane: GuidePlane;
	/** Vestibule (floor of mouth for mandible) depth in mm, measured from gingival margin. Typical 5-15mm. */
	vestibuleMm: number;
	prognosis: Prognosis;
	crownRoot: CrownRoot;
	requiresAlteration: boolean;
	tipped: boolean;
	spacingMesial: SpacingType;
	spacingDistal: SpacingType;
	notes: string;
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

export function archOf(fdi: FDI): Arch {
	const q = Math.floor(fdi / 10);
	return q === 1 || q === 2 ? 'maxillary' : 'mandibular';
}

export function defaultSurvey(): ToothSurvey {
	return {
		status: 'present',
		undercutLocation: 'none',
		undercutDepthMm: 0,
		guidePlane: 'adequate',
		vestibuleMm: 10,
		prognosis: 'good',
		crownRoot: 'favorable',
		requiresAlteration: false,
		tipped: false,
		spacingMesial: 'none',
		spacingDistal: 'none',
		notes: ''
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
		teeth
	};
}
