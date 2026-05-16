import type {
	UndercutLocation,
	GuidePlane,
	Prognosis,
	CrownRoot,
	SpacingType
} from '$lib/types';

export const labels = {
	field: {
		status: 'สถานะฟัน',
		undercutLocation: 'ตำแหน่ง Undercut',
		undercutDepthMm: 'ความลึก Undercut (mm)',
		guidePlane: 'Guide Plane',
		vestibuleMm: 'Vestibule depth (mm)',
		prognosis: 'Prognosis',
		crownRoot: 'C:R Ratio',
		requiresAlteration: 'ต้องการ Alteration',
		tipped: 'ฟันล้ม (Tipped)',
		spacingMesial: 'ช่องห่างด้าน Mesial',
		spacingDistal: 'ช่องห่างด้าน Distal',
		notes: 'บันทึก'
	},
	spacing: {
		none: 'ไม่มี',
		diastema: 'Diastema',
		drift: 'Drift/Tipping',
		foodTrap: 'Food trap',
		esthetic: 'Esthetic gap'
	} satisfies Record<SpacingType, string>,
	status: {
		present: 'มีอยู่',
		missing: 'หายไป'
	},
	undercutLocation: {
		none: 'ไม่มี',
		mesial: 'Mesial',
		distal: 'Distal',
		buccal: 'Buccal',
		lingual: 'Lingual'
	} satisfies Record<UndercutLocation, string>,
	guidePlane: {
		absent: 'ไม่มี',
		partial: 'บางส่วน',
		adequate: 'พอเพียง'
	} satisfies Record<GuidePlane, string>,
	prognosis: {
		good: 'ดี',
		questionable: 'น่าสงสัย',
		poor: 'แย่'
	} satisfies Record<Prognosis, string>,
	crownRoot: {
		favorable: 'ดี',
		borderline: 'พอใช้',
		unfavorable: 'แย่'
	} satisfies Record<CrownRoot, string>,
	yesNo: {
		yes: 'ใช่',
		no: 'ไม่'
	}
} as const;
