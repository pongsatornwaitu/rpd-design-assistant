import { describe, it, expect } from 'vitest';
import { analyzePathOfInsertion } from './pathOfInsertion';
import { specializedClaspRecs } from './claspVariations';
import { analyzeCrossArch } from './crossArch';
import { analyzeEsthetic } from './esthetic';
import { findMissingSpans } from './spans';
import { classifyKennedy } from './kennedy';
import { emptyCase, type CaseData, type FDI } from '$lib/types';

function caseWithMissing(fdis: FDI[]): CaseData {
	const c = emptyCase();
	for (const fdi of fdis) c.teeth[fdi].status = 'missing';
	return c;
}

describe('Path of Insertion', () => {
	it('recommends rotational path when anterior bounded + good anterior undercut', () => {
		const data = caseWithMissing([11, 22]);
		data.teeth[12].undercutDepthMm = 0.5;
		data.teeth[21].undercutDepthMm = 0.5;
		data.teeth[23].undercutDepthMm = 0.5;
		const spans = findMissingSpans('maxilla', data);
		const esthetic = analyzeEsthetic('maxilla', data, spans, [12, 21, 23]);
		const r = analyzePathOfInsertion('maxilla', data, [12, 21, 23], esthetic);
		expect(r.recommendedPath).toBe('rotational');
		expect(r.feasibilityForRotational).toBe('feasible');
	});

	it('falls back to single vertical when anterior undercut insufficient', () => {
		const data = caseWithMissing([11, 22]);
		data.teeth[12].undercutDepthMm = 0.25;
		data.teeth[21].undercutDepthMm = 0.25;
		data.teeth[23].undercutDepthMm = 0.25;
		const spans = findMissingSpans('maxilla', data);
		const esthetic = analyzeEsthetic('maxilla', data, spans, [12, 21, 23]);
		const r = analyzePathOfInsertion('maxilla', data, [12, 21, 23], esthetic);
		expect(r.recommendedPath).toBe('single-vertical');
	});

	it('suggests tilted path when undercuts predominantly mesial', () => {
		const data = caseWithMissing([15]);
		data.teeth[14].undercutLocation = 'mesial';
		data.teeth[14].undercutDepthMm = 0.5;
		data.teeth[16].undercutLocation = 'mesial';
		data.teeth[16].undercutDepthMm = 0.5;
		data.teeth[17].undercutLocation = 'mesial';
		data.teeth[17].undercutDepthMm = 0.5;
		const spans = findMissingSpans('maxilla', data);
		const esthetic = analyzeEsthetic('maxilla', data, spans, [14, 16, 17]);
		const r = analyzePathOfInsertion('maxilla', data, [14, 16, 17], esthetic);
		expect(r.recommendedPath).toBe('tilted-anterior');
	});
});

describe('Specialized clasps', () => {
	it('recommends ring clasp for tipped lone-standing molar', () => {
		// 27 is most distal molar — make 28 (3rd molar) missing so 27 has no posterior neighbor
		const data2 = caseWithMissing([26, 25, 28]);
		data2.teeth[27].tipped = true;
		const spans = findMissingSpans('maxilla', data2);
		const recs = specializedClaspRecs('maxilla', data2, spans, [27, 24]);
		expect(recs.some((r) => r.title.includes('Ring clasp'))).toBe(true);
	});

	it('recommends embrasure clasp for 2 adjacent posterior abutments without saddle between', () => {
		// Class II Mod 1: 17,16 missing on right; bounded 24-25 missing
		const data = caseWithMissing([17, 16, 24, 25]);
		const spans = findMissingSpans('maxilla', data);
		// Abutments: 15 (right side terminal), 23 + 26 (left side bounded)
		const recs = specializedClaspRecs('maxilla', data, spans, [15, 23, 26]);
		// 23 and 26 are NOT adjacent so no embrasure; we need a true adjacent pair
		// Let's test a case where 14 and 15 are abutments adjacent
		// Actually: missing 24 25 26 27 (Class II) — abutments 23 (left end). On right side present 14 15 16 17
		// For embrasure we need 2 adjacent present teeth BOTH listed as abutments
		const data2 = caseWithMissing([26, 27]);
		const spans2 = findMissingSpans('maxilla', data2);
		// Distal extension on left, abutment = 25; opposing side teeth 14-17 all present
		// 14, 15 both designated as abutments for cross-arch — test this
		const recs2 = specializedClaspRecs('maxilla', data2, spans2, [14, 15, 25]);
		expect(recs2.some((r) => r.title.includes('Embrasure'))).toBe(true);
	});

	it('recommends continuous bar when distal extension + many anterior teeth', () => {
		const data = caseWithMissing([17, 16, 26, 27]);
		const spans = findMissingSpans('maxilla', data);
		const recs = specializedClaspRecs('maxilla', data, spans, [15, 25]);
		expect(recs.some((r) => r.title.includes('Continuous bar'))).toBe(true);
	});

	it('recommends reverse Akers when posterior terminal abutment has mesial undercut', () => {
		const data = caseWithMissing([17, 16]);
		data.teeth[15].undercutLocation = 'mesial';
		data.teeth[15].undercutDepthMm = 0.25;
		const spans = findMissingSpans('maxilla', data);
		const recs = specializedClaspRecs('maxilla', data, spans, [15]);
		expect(recs.some((r) => r.title.includes('Reverse circumferential'))).toBe(true);
	});
});

describe('Cross-arch stabilization', () => {
	it('not required for Class III', () => {
		const data = caseWithMissing([15]);
		const cls = classifyKennedy('maxilla', data);
		const spans = findMissingSpans('maxilla', data);
		const r = analyzeCrossArch('maxilla', data, spans, cls.className);
		expect(r.required).toBe(false);
	});

	it('required for Class II — identifies extension side', () => {
		const data = caseWithMissing([26, 27]);
		const cls = classifyKennedy('maxilla', data);
		const spans = findMissingSpans('maxilla', data);
		const r = analyzeCrossArch('maxilla', data, spans, cls.className);
		expect(r.required).toBe(true);
		expect(r.side).toBe('left');
		expect(r.recommendations.length).toBeGreaterThan(0);
	});

	it('Class II rec mentions rigid major connector + contralateral indirect', () => {
		const data = caseWithMissing([46, 47]);
		const cls = classifyKennedy('mandible', data);
		const spans = findMissingSpans('mandible', data);
		const r = analyzeCrossArch('mandible', data, spans, cls.className);
		const titles = r.recommendations.map((x) => x.title).join(' ');
		expect(titles).toMatch(/rigid|Rigid/);
		expect(titles).toMatch(/Indirect|indirect/);
	});
});

describe('Rest seat type per abutment', () => {
	it('cingulum rest recommendation for canine abutment', async () => {
		const { analyzeArch } = await import('./recommendations');
		const data = caseWithMissing([11, 12]);
		const cls = classifyKennedy('maxilla', data);
		const r = analyzeArch('maxilla', data, cls);
		const restTitles = r.rests.map((x) => x.title).join(' ');
		const restDetails = r.rests.map((x) => x.detail).join(' ');
		// abutments would be 13 (canine) and 21
		expect(restDetails).toMatch(/cingulum/i);
	});
});
