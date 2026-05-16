import { describe, it, expect } from 'vitest';
import { classifyKennedy } from './kennedy';
import { emptyCase, type CaseData, type FDI } from '$lib/types';

function caseWithMissing(fdis: FDI[]): CaseData {
	const c = emptyCase();
	for (const fdi of fdis) c.teeth[fdi].status = 'missing';
	return c;
}

describe('classifyKennedy — maxilla', () => {
	it('no missing → ไม่มีพื้นที่ไร้ฟัน', () => {
		const r = classifyKennedy('maxilla', emptyCase());
		expect(r.className).toBe('none');
	});

	it('bilateral distal extension (17,16,26,27) → Class I', () => {
		const r = classifyKennedy('maxilla', caseWithMissing([17, 16, 26, 27]));
		expect(r.className).toBe('I');
		expect(r.modification).toBe(0);
		expect(r.label).toBe('Kennedy Class I');
	});

	it('Class I with one additional bounded span (Mod 1)', () => {
		const r = classifyKennedy('maxilla', caseWithMissing([17, 16, 26, 27, 13]));
		expect(r.className).toBe('I');
		expect(r.modification).toBe(1);
		expect(r.label).toBe('Kennedy Class I Mod 1');
	});

	it('unilateral distal extension (26,27) → Class II', () => {
		const r = classifyKennedy('maxilla', caseWithMissing([26, 27]));
		expect(r.className).toBe('II');
		expect(r.modification).toBe(0);
	});

	it('Class II with one bounded span (Mod 1)', () => {
		const r = classifyKennedy('maxilla', caseWithMissing([26, 27, 14]));
		expect(r.className).toBe('II');
		expect(r.modification).toBe(1);
	});

	it('bounded posterior (15,14) → Class III', () => {
		const r = classifyKennedy('maxilla', caseWithMissing([15, 14]));
		expect(r.className).toBe('III');
		expect(r.modification).toBe(0);
	});

	it('two bounded spans → Class III Mod 1', () => {
		const r = classifyKennedy('maxilla', caseWithMissing([15, 14, 24, 25]));
		expect(r.className).toBe('III');
		expect(r.modification).toBe(1);
	});

	it('anterior crossing midline (12,11,21,22) → Class IV', () => {
		const r = classifyKennedy('maxilla', caseWithMissing([12, 11, 21, 22]));
		expect(r.className).toBe('IV');
		expect(r.modification).toBe(0);
	});

	it('all teeth missing → ไม่มีฟันธรรมชาติเหลือ', () => {
		const all = caseWithMissing([
			18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28
		]);
		const r = classifyKennedy('maxilla', all, true);
		expect(r.className).toBe('none');
	});
});

describe('classifyKennedy — mandible', () => {
	it('bilateral distal extension (37,36,46,47) → Class I', () => {
		const r = classifyKennedy('mandible', caseWithMissing([37, 36, 46, 47]));
		expect(r.className).toBe('I');
	});

	it('anterior crossing midline (42,41,31,32) → Class IV', () => {
		const r = classifyKennedy('mandible', caseWithMissing([42, 41, 31, 32]));
		expect(r.className).toBe('IV');
	});

	it('single bounded (46) → Class III', () => {
		const r = classifyKennedy('mandible', caseWithMissing([46]));
		expect(r.className).toBe('III');
	});
});
