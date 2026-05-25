import { describe, it, expect } from 'vitest';
import { generateMouthPrep } from './mouthPrep';
import { emptyCase, type CaseData, type FDI } from '$lib/types';

function caseWithMissing(fdis: FDI[]): CaseData {
	const c = emptyCase();
	for (const fdi of fdis) c.teeth[fdi].status = 'missing';
	return c;
}

describe('Mouth preparation checklist', () => {
	it('always includes rest seat preparation when there are abutments', () => {
		const data = caseWithMissing([15]);
		const prep = generateMouthPrep('maxilla', data, [14, 16]);
		expect(prep.some((p) => p.step === 'Rest seat preparation')).toBe(true);
	});

	it('includes extraction step for poor prognosis abutment', () => {
		const data = caseWithMissing([15]);
		data.teeth[14].prognosis = 'poor';
		const prep = generateMouthPrep('maxilla', data, [14, 16]);
		expect(prep.some((p) => p.step.includes('Extraction'))).toBe(true);
	});

	it('includes orthodontic uprighting for tipped abutment', () => {
		const data = caseWithMissing([15]);
		data.teeth[16].tipped = true;
		const prep = generateMouthPrep('maxilla', data, [14, 16]);
		expect(prep.some((p) => p.step.includes('uprighting'))).toBe(true);
	});

	it('includes enameloplasty for supraerupted opposing', () => {
		const data = caseWithMissing([15]);
		data.teeth[14].supraerupted = true;
		const prep = generateMouthPrep('maxilla', data, [14, 16]);
		expect(prep.some((p) => p.step.includes('Enameloplasty'))).toBe(true);
	});

	it('includes guide plane prep when guide plane absent', () => {
		const data = caseWithMissing([15]);
		data.teeth[14].guidePlane = 'absent';
		const prep = generateMouthPrep('maxilla', data, [14, 16]);
		expect(prep.some((p) => p.step.includes('Guide plane'))).toBe(true);
	});

	it('includes surveyed crown step when flagged', () => {
		const data = caseWithMissing([15]);
		data.teeth[14].surveyedCrown = true;
		const prep = generateMouthPrep('maxilla', data, [14, 16]);
		expect(prep.some((p) => p.step.includes('Surveyed'))).toBe(true);
	});

	it('includes periodontal therapy for mobile teeth', () => {
		const data = caseWithMissing([15]);
		data.teeth[14].mobility = 'grade2';
		const prep = generateMouthPrep('maxilla', data, [14, 16]);
		expect(prep.some((p) => p.step.includes('Periodontal'))).toBe(true);
	});

	it('always ends with final impression note', () => {
		const data = caseWithMissing([15]);
		const prep = generateMouthPrep('maxilla', data, [14, 16]);
		expect(prep[prep.length - 1].step).toBe('Final impression');
	});
});
