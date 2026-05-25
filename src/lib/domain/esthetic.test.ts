import { describe, it, expect } from 'vitest';
import { analyzeEsthetic } from './esthetic';
import { findMissingSpans } from './spans';
import { emptyCase, type CaseData, type FDI } from '$lib/types';

function caseWithMissing(fdis: FDI[]): CaseData {
	const c = emptyCase();
	for (const fdi of fdis) c.teeth[fdi].status = 'missing';
	return c;
}

describe('Esthetic tier classification', () => {
	it('no missing → no-anterior-loss', () => {
		const data = emptyCase();
		const r = analyzeEsthetic('maxilla', data, [], []);
		expect(r.tier).toBe('no-anterior-loss');
	});

	it('1 anterior missing → single-tooth → suggests fixed prosthesis first', () => {
		const data = caseWithMissing([11]);
		const spans = findMissingSpans('maxilla', data);
		const r = analyzeEsthetic('maxilla', data, spans, [12, 21]);
		expect(r.tier).toBe('single-tooth');
		expect(r.primaryStrategy).toMatch(/fixed prosthesis|Maryland bridge|implant/i);
	});

	it('2-3 anterior missing → reverse Akers + lingual rest strategy', () => {
		const data = caseWithMissing([11, 22]);
		const spans = findMissingSpans('maxilla', data);
		const r = analyzeEsthetic('maxilla', data, spans, [12, 21, 23]);
		expect(r.tier).toBe('two-three-teeth');
		expect(r.primaryStrategy).toMatch(/Reverse Akers|reverse circumferential/i);
	});

	it('4 anterior missing (12-22) → four-teeth → borderline', () => {
		const data = caseWithMissing([12, 11, 21, 22]);
		const spans = findMissingSpans('maxilla', data);
		const r = analyzeEsthetic('maxilla', data, spans, [13, 23]);
		expect(r.tier).toBe('four-teeth');
		expect(r.primaryStrategy).toMatch(/borderline|stress.*releasing|tissue support/i);
	});

	it('canine-to-canine loss → canine-to-canine tier', () => {
		const data = caseWithMissing([13, 12, 11, 21, 22, 23]);
		const spans = findMissingSpans('maxilla', data);
		const r = analyzeEsthetic('maxilla', data, spans, [14, 24]);
		expect(r.tier).toBe('canine-to-canine');
		expect(r.missingCanines.length).toBe(2);
	});

	it('5 anterior missing without both canines → five-plus-teeth', () => {
		const data = caseWithMissing([12, 11, 21, 22, 23]);
		const spans = findMissingSpans('maxilla', data);
		const r = analyzeEsthetic('maxilla', data, spans, [13, 24]);
		expect(r.tier).toBe('five-plus-teeth');
		expect(r.primaryStrategy).toMatch(/tissue-supported/i);
	});

	it('detects abutments in esthetic zone', () => {
		const data = caseWithMissing([11, 22]);
		const spans = findMissingSpans('maxilla', data);
		const r = analyzeEsthetic('maxilla', data, spans, [12, 21, 23]);
		expect(r.abutmentsInEstheticZone).toContain(12);
		expect(r.abutmentsInEstheticZone).toContain(21);
		expect(r.abutmentsInEstheticZone).toContain(23);
	});
});
