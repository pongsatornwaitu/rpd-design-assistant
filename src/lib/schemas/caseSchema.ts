import { z } from 'zod';
import { ALL_FDI, defaultSurvey, type CaseData, type ToothSurvey } from '$lib/types';

const surveySchema = z.object({
	status: z.enum(['present', 'missing']).default('present'),
	undercutLocation: z.enum(['none', 'mesial', 'distal', 'buccal', 'lingual']).default('none'),
	undercutDepthMm: z.number().min(0).max(3).default(0),
	guidePlane: z.enum(['absent', 'partial', 'adequate']).default('adequate'),
	vestibuleMm: z.number().min(0).max(25).default(10),
	prognosis: z.enum(['good', 'questionable', 'poor']).default('good'),
	crownRoot: z.enum(['favorable', 'borderline', 'unfavorable']).default('favorable'),
	requiresAlteration: z.boolean().default(false),
	tipped: z.boolean().default(false),
	spacingMesial: z.enum(['none', 'diastema', 'drift', 'foodTrap', 'esthetic']).default('none'),
	spacingDistal: z.enum(['none', 'diastema', 'drift', 'foodTrap', 'esthetic']).default('none'),
	notes: z.string().default('')
});

const caseV2Schema = z.object({
	schemaVersion: z.literal(2),
	meta: z.object({
		id: z.string(),
		title: z.string(),
		patient: z.string().default(''),
		createdAt: z.string(),
		updatedAt: z.string()
	}),
	teeth: z.record(z.string(), surveySchema)
});

const caseV1Schema = z
	.object({
		remaining: z.array(z.number()).optional(),
		survey: z.record(z.string(), z.any()).optional(),
		title: z.string().optional()
	})
	.passthrough();

export function parseCase(input: unknown): CaseData {
	const v2 = caseV2Schema.safeParse(input);
	if (v2.success) {
		return normalizeTeeth(v2.data as CaseData);
	}

	const v1 = caseV1Schema.safeParse(input);
	if (v1.success && v1.data.remaining) {
		return migrateV1(v1.data);
	}

	throw new Error('รูปแบบไฟล์ไม่ถูกต้อง — ไม่ใช่ RPD case JSON');
}

function normalizeTeeth(data: CaseData): CaseData {
	const teeth = { ...data.teeth };
	for (const fdi of ALL_FDI) {
		if (!teeth[fdi]) teeth[fdi] = defaultSurvey();
	}
	return { ...data, teeth };
}

function migrateV1(v1: z.infer<typeof caseV1Schema>): CaseData {
	const teeth: CaseData['teeth'] = {} as CaseData['teeth'];
	const remaining = new Set(v1.remaining ?? []);
	for (const fdi of ALL_FDI) {
		const v1Tooth = v1.survey?.[String(fdi)];
		teeth[fdi] = {
			...defaultSurvey(),
			status: remaining.has(fdi) ? 'present' : 'missing',
			...(v1Tooth && typeof v1Tooth === 'object' ? sanitizeV1Tooth(v1Tooth) : {})
		};
	}
	const now = new Date().toISOString();
	return {
		schemaVersion: 2,
		meta: {
			id: crypto.randomUUID(),
			title: v1.title ?? 'นำเข้าจาก v1',
			patient: '',
			createdAt: now,
			updatedAt: now
		},
		teeth
	};
}

const UNDERCUT_DEPTH_MAP: Record<string, number> = {
	none: 0,
	shallow: 0.25,
	medium: 0.5,
	deep: 0.75
};
const VESTIBULE_MAP: Record<string, number> = {
	shallow: 5,
	normal: 10,
	deep: 13
};

function sanitizeV1Tooth(t: Record<string, unknown>): Partial<ToothSurvey> {
	const out: Record<string, unknown> = {};
	const map: Record<string, string> = {
		undercutLocation: 'undercutLocation',
		guidePlane: 'guidePlane',
		prognosis: 'prognosis',
		crownRoot: 'crownRoot',
		tipped: 'tipped',
		requiresAlteration: 'requiresAlteration',
		notes: 'notes'
	};
	for (const [k, v] of Object.entries(t)) {
		if (k in map) out[map[k]] = v;
	}
	// Migrate enum-based depth/vestibule to numeric mm
	if (typeof t.undercutDepth === 'string' && t.undercutDepth in UNDERCUT_DEPTH_MAP) {
		out.undercutDepthMm = UNDERCUT_DEPTH_MAP[t.undercutDepth];
	} else if (typeof t.undercutDepthMm === 'number') {
		out.undercutDepthMm = t.undercutDepthMm;
	}
	if (typeof t.vestibule === 'string' && t.vestibule in VESTIBULE_MAP) {
		out.vestibuleMm = VESTIBULE_MAP[t.vestibule];
	} else if (typeof t.vestibuleMm === 'number') {
		out.vestibuleMm = t.vestibuleMm;
	}
	const parsed = surveySchema.partial().safeParse(out);
	return parsed.success ? parsed.data : {};
}
