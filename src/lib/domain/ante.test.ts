import { describe, it, expect } from 'vitest';
import { applyAntesLaw } from './ante';
import { findMissingSpans } from './spans';
import { emptyCase, type CaseData, type FDI } from '$lib/types';

function caseWithMissing(fdis: FDI[]): CaseData {
	const c = emptyCase();
	for (const fdi of fdis) c.teeth[fdi].status = 'missing';
	return c;
}

describe("Ante's Law check", () => {
	it('passes when abutments are large molars and pontic small (single premolar missing)', () => {
		const data = caseWithMissing([15]);
		const spans = findMissingSpans('maxilla', data);
		const r = applyAntesLaw(data, spans, [14, 16], true);
		expect(r.violated).toBe(false);
		expect(r.ratio).toBeGreaterThan(1);
	});

	it('violated when too many pontics relative to abutments (tooth-supported)', () => {
		// pretend Class III with 5 pontics + 2 small incisor abutments
		const data = caseWithMissing([14, 15, 16, 17, 24]);
		const spans = findMissingSpans('maxilla', data);
		const r = applyAntesLaw(data, spans, [13, 25], true);
		expect(r.violated).toBe(true);
	});

	it('reduces abutment effective area when prognosis poor', () => {
		const dataGood = caseWithMissing([15]);
		const dataPoor = caseWithMissing([15]);
		dataPoor.teeth[16].prognosis = 'poor';
		const spans = findMissingSpans('maxilla', dataGood);
		const rGood = applyAntesLaw(dataGood, spans, [14, 16], true);
		const rPoor = applyAntesLaw(dataPoor, spans, [14, 16], true);
		expect(rPoor.abutmentArea).toBeLessThan(rGood.abutmentArea);
	});

	it('tissue-supported: not violated even with low ratio', () => {
		const data = caseWithMissing([14, 15, 16, 17, 24]);
		const spans = findMissingSpans('maxilla', data);
		const r = applyAntesLaw(data, spans, [13], false);
		expect(r.violated).toBe(false);
	});
});
