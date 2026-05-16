import type { CaseData, FDI } from '$lib/types';
import { MAXILLARY_FDI, MANDIBULAR_FDI } from '$lib/types';

export type ArchKey = 'maxilla' | 'mandible';

export interface EdentulousSpan {
	start: number;
	end: number;
	teeth: FDI[];
	rightAbutment: FDI | null;
	leftAbutment: FDI | null;
	distalRight: boolean;
	distalLeft: boolean;
	bounded: boolean;
}

const THIRD_MOLARS: ReadonlySet<FDI> = new Set([18, 28, 38, 48]);

export function archTeeth(arch: ArchKey, includeThirdMolars = false): FDI[] {
	const base = arch === 'maxilla' ? MAXILLARY_FDI : MANDIBULAR_FDI;
	return includeThirdMolars ? base : base.filter((t) => !THIRD_MOLARS.has(t));
}

export function findMissingSpans(arch: ArchKey, data: CaseData, includeThirdMolars = false): EdentulousSpan[] {
	const teeth = archTeeth(arch, includeThirdMolars);
	const spans: EdentulousSpan[] = [];
	let active: { start: number; end: number; teeth: FDI[] } | null = null;

	teeth.forEach((tooth, index) => {
		const missing = data.teeth[tooth].status === 'missing';
		if (missing && !active) {
			active = { start: index, end: index, teeth: [tooth] };
		} else if (missing && active) {
			active.end = index;
			active.teeth.push(tooth);
		} else if (!missing && active) {
			spans.push(enrichSpan(active, teeth));
			active = null;
		}
	});

	if (active) spans.push(enrichSpan(active, teeth));
	return spans;
}

function enrichSpan(
	span: { start: number; end: number; teeth: FDI[] },
	teeth: FDI[]
): EdentulousSpan {
	const rightAbutment = span.start > 0 ? teeth[span.start - 1] : null;
	const leftAbutment = span.end < teeth.length - 1 ? teeth[span.end + 1] : null;
	return {
		...span,
		rightAbutment,
		leftAbutment,
		distalRight: span.start === 0 && Boolean(leftAbutment),
		distalLeft: span.end === teeth.length - 1 && Boolean(rightAbutment),
		bounded: Boolean(rightAbutment && leftAbutment)
	};
}
