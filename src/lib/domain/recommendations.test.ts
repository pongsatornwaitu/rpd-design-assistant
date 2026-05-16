import { describe, it, expect } from 'vitest';
import { analyzeArch } from './recommendations';
import { classifyKennedy } from './kennedy';
import { emptyCase, type CaseData, type FDI } from '$lib/types';

function caseWithMissing(fdis: FDI[]): CaseData {
	const c = emptyCase();
	for (const fdi of fdis) c.teeth[fdi].status = 'missing';
	return c;
}

describe('analyzeArch — Class I distal extension', () => {
	const data = caseWithMissing([17, 16, 26, 27]);
	const cls = classifyKennedy('maxilla', data);
	const result = analyzeArch('maxilla', data, cls);

	it('classification matches', () => {
		expect(result.classification.className).toBe('I');
	});

	it('identifies terminal-distal abutments at 15 and 25', () => {
		const roles = result.abutmentRoles;
		const r15 = roles.find((r) => r.fdi === 15);
		const r25 = roles.find((r) => r.fdi === 25);
		expect(r15?.role).toBe('terminal-distal');
		expect(r25?.role).toBe('terminal-distal');
	});

	it('recommends RPI (not Akers) for distal terminal abutment with adequate undercut', () => {
		data.teeth[15].undercutDepthMm = 0.25;
		const r = analyzeArch('maxilla', data, cls);
		const clasp15 = r.clasps.find((c) => c.title.includes('15'));
		expect(clasp15?.title).toMatch(/RPI/);
		expect(clasp15?.title).not.toMatch(/Akers|Circumferential/);
	});

	it('recommends mesial rest (Krol RPI principle) for distal extension', () => {
		const mesialRest = result.rests.find((r) => r.title.includes('Mesial occlusal rest'));
		expect(mesialRest).toBeDefined();
		expect(mesialRest?.detail).toMatch(/fulcrum/);
	});

	it('cites Krol 1973 for RPI recommendation', () => {
		data.teeth[15].undercutDepthMm = 0.25;
		const r = analyzeArch('maxilla', data, cls);
		const clasp15 = r.clasps.find((c) => c.title.includes('15'));
		expect(clasp15?.references.some((ref) => ref.source.match(/Krol/))).toBe(true);
	});

	it('recommends combination clasp / wrought-wire for deep undercut on terminal abutment', () => {
		data.teeth[15].undercutDepthMm = 0.75;
		const r = analyzeArch('maxilla', data, cls);
		const clasp15 = r.clasps.find((c) => c.title.includes('15'));
		expect(clasp15?.title).toMatch(/RPI|Combination|wrought-wire/i);
	});

	it('warns when undercut < 0.25mm on terminal abutment', () => {
		data.teeth[15].undercutDepthMm = 0.1;
		const r = analyzeArch('maxilla', data, cls);
		const clasp15 = r.clasps.find((c) => c.title.includes('15'));
		expect(clasp15?.severity).toBe('warn');
	});
});

describe('analyzeArch — Class III bounded', () => {
	it('recommends Akers (cast circumferential) for bounded abutment with normal undercut', () => {
		const data = caseWithMissing([15, 14]);
		data.teeth[13].undercutDepthMm = 0.25;
		data.teeth[16].undercutDepthMm = 0.25;
		const cls = classifyKennedy('maxilla', data);
		const result = analyzeArch('maxilla', data, cls);
		const clasp13 = result.clasps.find((c) => c.title.includes('13'));
		expect(clasp13?.title).toMatch(/Akers|Circumferential/);
		expect(clasp13?.title).not.toMatch(/RPI/);
	});

	it('recommends wrought-wire (not Akers) for bounded with deep undercut', () => {
		const data = caseWithMissing([16]);
		data.teeth[15].undercutDepthMm = 0.75;
		const cls = classifyKennedy('maxilla', data);
		const result = analyzeArch('maxilla', data, cls);
		const clasp15 = result.clasps.find((c) => c.title.includes('15'));
		expect(clasp15?.title).toMatch(/wrought-wire/i);
	});
});

describe('analyzeArch — mandible major connector by vestibule', () => {
	it('recommends lingual plate when any abutment vestibule < 8mm', () => {
		const data = caseWithMissing([36]);
		data.teeth[35].vestibuleMm = 6;
		const cls = classifyKennedy('mandible', data);
		const result = analyzeArch('mandible', data, cls);
		expect(result.majorConnector.title).toMatch(/Lingual Plate/);
	});

	it('recommends lingual bar when vestibule ≥ 8mm everywhere', () => {
		const data = caseWithMissing([36]);
		const cls = classifyKennedy('mandible', data);
		const result = analyzeArch('mandible', data, cls);
		expect(result.majorConnector.title).toMatch(/Lingual Bar/);
	});
});

describe('analyzeArch — concerns', () => {
	it('flags poor prognosis abutment as danger', () => {
		const data = caseWithMissing([15, 14]);
		data.teeth[13].prognosis = 'poor';
		const cls = classifyKennedy('maxilla', data);
		const result = analyzeArch('maxilla', data, cls);
		const dangers = result.concerns.filter((c) => c.severity === 'danger');
		expect(dangers.length).toBeGreaterThan(0);
	});

	it('disqualifies abutment with poor prognosis from clasp recommendation', () => {
		const data = caseWithMissing([26, 27]);
		data.teeth[25].prognosis = 'poor';
		const cls = classifyKennedy('maxilla', data);
		const result = analyzeArch('maxilla', data, cls);
		const clasp25 = result.clasps.find((c) => c.title.includes('25'));
		expect(clasp25?.severity).toBe('danger');
	});

	it('recommends RPA for tipped distal terminal abutment', () => {
		const data = caseWithMissing([26, 27]);
		data.teeth[25].tipped = true;
		const cls = classifyKennedy('maxilla', data);
		const result = analyzeArch('maxilla', data, cls);
		const clasp25 = result.clasps.find((c) => c.title.includes('25'));
		expect(clasp25?.title).toMatch(/RPA/);
	});
});
