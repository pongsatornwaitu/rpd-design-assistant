import { describe, it, expect } from 'vitest';
import { analyzeFulcrum } from './fulcrum';
import { findMissingSpans } from './spans';
import { emptyCase, type CaseData, type FDI } from '$lib/types';

function caseWithMissing(fdis: FDI[]): CaseData {
	const c = emptyCase();
	for (const fdi of fdis) c.teeth[fdi].status = 'missing';
	return c;
}

describe('Fulcrum + indirect retention', () => {
	it('Class I (bilateral distal) → indirect retainer ANTERIOR to fulcrum', () => {
		const data = caseWithMissing([17, 16, 26, 27]);
		const spans = findMissingSpans('maxilla', data);
		const f = analyzeFulcrum('maxilla', data, spans, 'I');
		expect(f.type).toBe('distal-extension');
		expect(f.indirectRetainerPositions.length).toBeGreaterThan(0);
		// indirect should be anterior (closer to midline) — premolar/canine
		expect(f.indirectRetainerPositions.every((fdi) => fdi % 10 <= 5)).toBe(true);
	});

	it('Class II — fulcrum + indirect anterior on side with extension', () => {
		const data = caseWithMissing([26, 27]);
		const spans = findMissingSpans('maxilla', data);
		const f = analyzeFulcrum('maxilla', data, spans, 'II');
		expect(f.type).toBe('distal-extension');
		expect(f.indirectRetainerPositions.length).toBeGreaterThan(0);
	});

	it('Class IV → indirect POSTERIOR to fulcrum', () => {
		const data = caseWithMissing([12, 11, 21, 22]);
		const spans = findMissingSpans('maxilla', data);
		const f = analyzeFulcrum('maxilla', data, spans, 'IV');
		expect(f.type).toBe('anterior-class-iv');
		// indirect should be molars (6 or 7)
		expect(f.indirectRetainerPositions.every((fdi) => fdi % 10 >= 6)).toBe(true);
	});

	it('Class III → no formal indirect retainer needed', () => {
		const data = caseWithMissing([15]);
		const spans = findMissingSpans('maxilla', data);
		const f = analyzeFulcrum('maxilla', data, spans, 'III');
		expect(f.type).toBe('bounded');
		expect(f.indirectRetainerPositions).toEqual([]);
	});

	it('no missing → fulcrum type none', () => {
		const data = emptyCase();
		const f = analyzeFulcrum('maxilla', data, [], 'none');
		expect(f.type).toBe('none');
	});
});
