import { describe, it, expect } from 'vitest';
import { analyzeInterarchSpace } from './interarch';
import { emptyCase, type CaseData } from '$lib/types';

describe('Interarch space analysis', () => {
	it('no concerns when all spaces are ideal', () => {
		const data = emptyCase();
		data.interarch.anteriorMm = 12;
		data.interarch.posteriorRightMm = 8;
		data.interarch.posteriorLeftMm = 8;
		const c = analyzeInterarchSpace('maxilla', data);
		expect(c.length).toBe(0);
	});

	it('warns when posterior < 6mm', () => {
		const data = emptyCase();
		data.interarch.posteriorRightMm = 5;
		const c = analyzeInterarchSpace('maxilla', data);
		const post = c.find((x) => x.region === 'posterior-right');
		expect(post?.severity).toBe('warn');
	});

	it('danger when posterior < 4mm', () => {
		const data = emptyCase();
		data.interarch.posteriorRightMm = 3;
		const c = analyzeInterarchSpace('maxilla', data);
		const post = c.find((x) => x.region === 'posterior-right');
		expect(post?.severity).toBe('danger');
	});

	it('detects supraerupted opposing as localized concern', () => {
		const data = emptyCase();
		data.teeth[15].supraerupted = true;
		const c = analyzeInterarchSpace('maxilla', data);
		const sup = c.find((x) => x.region === 'localized');
		expect(sup?.affectedTeeth).toContain(15);
		expect(sup?.action).toMatch(/enameloplasty|intrusion|surveyed crown/i);
	});

	it('warns when anterior < 7mm (esthetic)', () => {
		const data = emptyCase();
		data.interarch.anteriorMm = 6;
		const c = analyzeInterarchSpace('maxilla', data);
		const ant = c.find((x) => x.region === 'anterior');
		expect(ant?.severity).toBe('warn');
	});
});
