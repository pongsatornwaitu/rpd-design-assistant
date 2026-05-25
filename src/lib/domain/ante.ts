import type { CaseData, FDI } from '$lib/types';
import { ROOT_SURFACE_AREA } from '$lib/types';
import type { EdentulousSpan } from './spans';

export interface AnteAnalysis {
	abutmentArea: number;
	pontifArea: number;
	ratio: number;
	violated: boolean;
	finding: string;
	implication: string;
}

/**
 * Ante's Law (Ante 1926, applied via Jepsen 1963 root surface areas):
 * "The combined pericemental area of the abutment teeth should be equal to or greater
 *  than that of the teeth to be replaced."
 *
 * Original applies to fixed bridges; the principle still informs RPD abutment selection
 * — though tooth-supported RPDs follow it strictly while tissue-supported (Class I/II)
 * shares load with the ridge, relaxing this constraint somewhat.
 */
export function applyAntesLaw(
	data: CaseData,
	spans: EdentulousSpan[],
	abutments: FDI[],
	isToothSupported: boolean
): AnteAnalysis {
	const abutmentArea = abutments.reduce(
		(sum, fdi) => sum + (ROOT_SURFACE_AREA[fdi] ?? 0) * abutmentWeight(data, fdi),
		0
	);
	const pontifArea = spans
		.flatMap((s) => s.teeth)
		.reduce((sum, fdi) => sum + (ROOT_SURFACE_AREA[fdi] ?? 0), 0);

	const ratio = pontifArea > 0 ? abutmentArea / pontifArea : Infinity;
	const violated = ratio < 1 && isToothSupported;

	let finding: string;
	let implication: string;

	if (ratio === Infinity) {
		finding = 'ไม่มี pontic — ไม่ต้องคำนวณ';
		implication = '';
	} else if (ratio >= 1.5) {
		finding = `Abutment area / Pontic area = ${ratio.toFixed(2)} — Ante's law: ผ่านอย่างปลอดภัย`;
		implication = 'Abutments แข็งแรงพอ รองรับ load จาก pontics ได้';
	} else if (ratio >= 1.0) {
		finding = `Abutment / Pontic = ${ratio.toFixed(2)} — Ante's law: ผ่าน (borderline)`;
		implication = 'พอใช้ — แต่ต้องระวัง overload ถ้า patient bruxism หรือ occlusion หนัก';
	} else {
		finding = `Abutment / Pontic = ${ratio.toFixed(2)} — Ante's law: ❌ violated (< 1.0)`;
		implication = isToothSupported
			? 'Abutment area น้อยกว่า pontic area — เสี่ยง abutment overload + failure; พิจารณา เพิ่ม abutments, splinting, หรือเปลี่ยนเป็น tissue-supported design'
			: 'Tissue-supported RPD — ridge ช่วยรับ load บางส่วน; Ante\'s law strict ไม่ใช้ตรงๆ แต่ยังควรระวัง';
	}

	return { abutmentArea, pontifArea, ratio, violated, finding, implication };
}

/** Reduce abutment "effective" area based on quality */
function abutmentWeight(data: CaseData, fdi: FDI): number {
	const s = data.teeth[fdi];
	let w = 1.0;
	if (s.prognosis === 'questionable') w *= 0.7;
	if (s.prognosis === 'poor') w *= 0.3;
	if (s.crownRoot === 'borderline') w *= 0.8;
	if (s.crownRoot === 'unfavorable') w *= 0.5;
	if (s.mobility === 'grade1') w *= 0.9;
	if (s.mobility === 'grade2') w *= 0.6;
	if (s.mobility === 'grade3') w *= 0.2;
	return w;
}
