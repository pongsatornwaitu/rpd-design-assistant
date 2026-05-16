import type { CaseData } from '$lib/types';
import { archTeeth, findMissingSpans, type ArchKey, type EdentulousSpan } from './spans';

export type KennedyClass = 'I' | 'II' | 'III' | 'IV' | 'none';

export interface Reference {
	source: string;
	page?: string;
}

export interface Classification {
	className: KennedyClass;
	modification: number;
	label: string;
	reason: string;
	references: Reference[];
}

const REF_APPLEGATE: Reference = {
	source: 'Applegate, Essentials of Removable Partial Denture Prosthesis (3rd ed.)',
	page: 'Ch. 3 — Classification'
};

const REF_CARR_BROWN: Reference = {
	source: "McCracken's Removable Partial Prosthodontics (Carr & Brown, 13th ed.)",
	page: 'Ch. 4 — Classification'
};

export function classifyKennedy(arch: ArchKey, data: CaseData, includeThirdMolars = false): Classification {
	const teeth = archTeeth(arch, includeThirdMolars);
	const spans = findMissingSpans(arch, data, includeThirdMolars);
	const presentCount = teeth.filter((t) => data.teeth[t].status === 'present').length;

	if (spans.length === 0) {
		return {
			className: 'none',
			modification: 0,
			label: 'ไม่มีพื้นที่ไร้ฟัน',
			reason: 'ไม่มี edentulous area ที่ต้องแทนที่',
			references: []
		};
	}

	if (presentCount === 0) {
		return {
			className: 'none',
			modification: 0,
			label: 'ไม่มีฟันธรรมชาติเหลือ',
			reason: 'ไม่มีฟันหลักยึดเหลือสำหรับ conventional RPD — พิจารณา complete denture/implant',
			references: [REF_CARR_BROWN]
		};
	}

	const distalSpans = spans.filter((s) => s.distalRight || s.distalLeft);

	if (distalSpans.length >= 2) {
		const mod = Math.max(0, spans.length - 2);
		return {
			className: 'I',
			modification: mod,
			label: formatLabel('I', mod),
			reason: 'มี bilateral distal extension posterior ต่อฟันธรรมชาติที่เหลือ',
			references: [REF_APPLEGATE, REF_CARR_BROWN]
		};
	}

	if (distalSpans.length === 1) {
		const mod = spans.length - 1;
		return {
			className: 'II',
			modification: mod,
			label: formatLabel('II', mod),
			reason: 'มี unilateral distal extension หนึ่งข้าง',
			references: [REF_APPLEGATE, REF_CARR_BROWN]
		};
	}

	if (spans.length === 1 && crossesMidline(arch, spans[0])) {
		return {
			className: 'IV',
			modification: 0,
			label: 'Kennedy Class IV',
			reason: 'มี single anterior edentulous area ที่ข้าม midline',
			references: [REF_APPLEGATE, REF_CARR_BROWN]
		};
	}

	const mod = Math.max(0, spans.length - 1);
	return {
		className: 'III',
		modification: mod,
		label: formatLabel('III', mod),
		reason: 'Edentulous area เป็น bounded saddle มีฟันธรรมชาติทั้งด้าน mesial และ distal',
		references: [REF_APPLEGATE, REF_CARR_BROWN]
	};
}

function formatLabel(cls: 'I' | 'II' | 'III', mod: number): string {
	return mod > 0 ? `Kennedy Class ${cls} Mod ${mod}` : `Kennedy Class ${cls}`;
}

function crossesMidline(arch: ArchKey, span: EdentulousSpan): boolean {
	if (arch === 'maxilla') {
		return span.teeth.includes(11) && span.teeth.includes(21);
	}
	return span.teeth.includes(41) && span.teeth.includes(31);
}
