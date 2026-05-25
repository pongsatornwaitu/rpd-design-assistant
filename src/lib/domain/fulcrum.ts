import type { CaseData, FDI } from '$lib/types';
import type { ArchKey, EdentulousSpan } from './spans';

export type FulcrumType = 'distal-extension' | 'bounded' | 'anterior-class-iv' | 'none';

export interface FulcrumAnalysis {
	arch: ArchKey;
	type: FulcrumType;
	/** Teeth defining the fulcrum line (rest positions) */
	definingTeeth: FDI[];
	/** Recommended indirect retainer position (FDI of tooth where to place auxiliary rest) */
	indirectRetainerPositions: FDI[];
	reason: string;
}

/**
 * Determine fulcrum line + where to place indirect retainer
 *
 * Class I/II: fulcrum line passes through terminal abutments (rests of direct retainers).
 *             Indirect retainer goes ANTERIOR to fulcrum line — perpendicular distance maximized.
 *             Typical: mesial fossa of premolar or cingulum of canine.
 *
 * Class IV:  fulcrum line passes through most posterior rests bilaterally.
 *            Indirect retainer goes POSTERIOR to fulcrum (further posteriorly).
 *
 * Class III: tooth-borne, no rotation concern, no formal indirect retainer needed
 *            unless there's an additional Mod with distal extension.
 */
export function analyzeFulcrum(
	arch: ArchKey,
	data: CaseData,
	spans: EdentulousSpan[],
	className: 'I' | 'II' | 'III' | 'IV' | 'none'
): FulcrumAnalysis {
	if (className === 'none' || spans.length === 0) {
		return {
			arch,
			type: 'none',
			definingTeeth: [],
			indirectRetainerPositions: [],
			reason: 'ไม่มี edentulous area ที่ต้องการ indirect retention'
		};
	}

	if (className === 'I' || className === 'II') {
		const terminalAbutments: FDI[] = [];
		for (const span of spans) {
			if (span.distalRight && span.leftAbutment) terminalAbutments.push(span.leftAbutment);
			if (span.distalLeft && span.rightAbutment) terminalAbutments.push(span.rightAbutment);
		}
		const indirect = findIndirectAnterior(arch, data, terminalAbutments);
		return {
			arch,
			type: 'distal-extension',
			definingTeeth: terminalAbutments,
			indirectRetainerPositions: indirect,
			reason:
				className === 'I'
					? 'Class I — fulcrum line ผ่าน terminal abutment สองข้าง; indirect retainer วาง anterior ต่อ fulcrum ห่างที่สุด (ตั้งฉาก) เพื่อต้านการ rotate ขึ้นของ distal extension base'
					: 'Class II — fulcrum line ผ่าน terminal abutment ฝั่งที่มี extension + abutment ฝั่งตรงข้าม (cross-arch); indirect retainer วาง anterior ต่อ fulcrum'
		};
	}

	if (className === 'IV') {
		// fulcrum line passes through posterior-most rest seats bilaterally
		const posteriorRests = findPosteriorRestPositions(arch, data);
		const indirect = findIndirectPosterior(arch, data, posteriorRests);
		return {
			arch,
			type: 'anterior-class-iv',
			definingTeeth: posteriorRests,
			indirectRetainerPositions: indirect,
			reason:
				'Class IV — fulcrum line ผ่าน rest ที่ posterior สุด; anterior saddle จะ tip ออก labially เมื่อบดเคี้ยว; indirect retainer วาง posterior ต่อ fulcrum (เช่น auxiliary rest บน molar) เพื่อต้าน rotation'
		};
	}

	// Class III — bounded, no indirect retainer required
	return {
		arch,
		type: 'bounded',
		definingTeeth: spans.flatMap((s) => [s.rightAbutment, s.leftAbutment].filter(Boolean) as FDI[]),
		indirectRetainerPositions: [],
		reason: 'Class III bounded — tooth-borne, ไม่ต้องการ formal indirect retainer; rests สองข้างของแต่ละ saddle กำหนด fulcrum'
	};
}

function findIndirectAnterior(arch: ArchKey, data: CaseData, terminals: FDI[]): FDI[] {
	if (!terminals.length) return [];
	// Find present teeth anterior to the most anterior terminal abutment
	const archTeeth = arch === 'maxilla' ? maxArch : manArch;
	const indices = terminals.map((t) => archTeeth.indexOf(t)).filter((i) => i >= 0);
	if (!indices.length) return [];

	// anterior means closer to midline (index closer to center of array)
	// for maxilla array [18..11, 21..28]: midline between index 7 and 8
	// for our purpose, "anterior" rests = canines/premolars on opposite side of saddle
	// Heuristic: pick most mesial present tooth on each side (toward midline from terminal)
	const positions: FDI[] = [];
	const midline = 8;
	for (const idx of indices) {
		// look toward midline for a present tooth (canine/premolar)
		const direction = idx < midline ? 1 : -1; // toward midline
		for (let i = idx + direction; i >= 0 && i < archTeeth.length; i += direction) {
			const fdi = archTeeth[i];
			if (data.teeth[fdi].status === 'present') {
				// prefer premolars/canines (closer to midline)
				positions.push(fdi);
				const mod = fdi % 10;
				if (mod >= 3 && mod <= 5) break; // good zone: canine to 2nd premolar
			}
			if (Math.abs(i - midline) <= 2) break;
		}
	}
	return [...new Set(positions)];
}

function findIndirectPosterior(arch: ArchKey, data: CaseData, posteriorRests: FDI[]): FDI[] {
	const archTeeth = arch === 'maxilla' ? maxArch : manArch;
	// indirect retainer should be on a tooth even further posterior than the rest line
	// (often a molar)
	const positions: FDI[] = [];
	for (const fdi of archTeeth) {
		const mod = fdi % 10;
		if (mod >= 6 && data.teeth[fdi].status === 'present' && !posteriorRests.includes(fdi)) {
			positions.push(fdi);
		}
	}
	return positions.slice(0, 2);
}

function findPosteriorRestPositions(arch: ArchKey, data: CaseData): FDI[] {
	const archTeeth = arch === 'maxilla' ? maxArch : manArch;
	// posterior-most present tooth on each side that would carry a direct retainer
	const halfMid = 8;
	const right = archTeeth.slice(0, halfMid).filter((f) => data.teeth[f].status === 'present');
	const left = archTeeth.slice(halfMid).filter((f) => data.teeth[f].status === 'present');
	const out: FDI[] = [];
	if (right.length) out.push(right[0]);
	if (left.length) out.push(left[left.length - 1]);
	return out;
}

const maxArch: FDI[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const manArch: FDI[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
