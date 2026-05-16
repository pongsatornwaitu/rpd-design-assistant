import { MAXILLARY_FDI, MANDIBULAR_FDI, type FDI } from '$lib/types';
import type { ArchKey } from './spans';

export interface ToothPosition {
	fdi: FDI;
	x: number;
	y: number;
	angle: number;
}

const ARCH_WIDTH = 360;
const ARCH_HEIGHT = 140;
const CENTER_X = 200;

export function archPositions(arch: ArchKey): ToothPosition[] {
	const fdis = arch === 'maxilla' ? MAXILLARY_FDI : MANDIBULAR_FDI;
	const n = fdis.length;
	const positions: ToothPosition[] = [];
	for (let i = 0; i < n; i++) {
		const t = i / (n - 1);
		const angle = (t - 0.5) * Math.PI;
		const x = CENTER_X + (Math.sin(angle) * ARCH_WIDTH) / 2;
		const yOffset = (1 - Math.cos(angle)) * ARCH_HEIGHT;
		const y = arch === 'maxilla' ? 30 + yOffset : 170 - yOffset;
		positions.push({ fdi: fdis[i], x, y, angle });
	}
	return positions;
}

export const SVG_VIEWBOX = { width: 400, height: 220 };
