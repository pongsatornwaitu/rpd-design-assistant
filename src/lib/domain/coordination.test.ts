import { describe, it, expect } from 'vitest';
import { analyzeArch } from './recommendations';
import { classifyKennedy } from './kennedy';
import { emptyCase, type CaseData, type FDI } from '$lib/types';

function caseWithMissing(fdis: FDI[]): CaseData {
	const c = emptyCase();
	for (const fdi of fdis) c.teeth[fdi].status = 'missing';
	return c;
}

describe('Cross-section coordination for anterior bounded esthetic case', () => {
	// User's scenario: missing 12 and 21 (Class III Mod 1, both anterior)
	const data = caseWithMissing([12, 21]);
	const cls = classifyKennedy('maxilla', data);
	const result = analyzeArch('maxilla', data, cls);

	it('Major connector should NOT be Single Palatal Strap when anterior teeth missing', () => {
		// Single palatal strap only for posterior bounded — anterior pontic needs wider coverage
		expect(result.majorConnector.title).not.toMatch(/Single Palatal Strap/);
	});

	it('Major connector should be AP Palatal Strap or Palatal Plate for anterior bounded', () => {
		expect(result.majorConnector.title).toMatch(/AP Palatal Strap|Palatal Plate/);
	});

	it('Direct retainer on anterior abutment (11, 13) should NOT default to plain Akers', () => {
		// In esthetic strategy, anterior abutments get cingulum rest, not Akers clasp
		const clasp11 = result.clasps.find((c) => c.title.includes('11'));
		const clasp13 = result.clasps.find((c) => c.title.includes('13'));

		// At least one anterior abutment should have cingulum rest (esthetic) recommendation
		const anyEsthetic = [clasp11, clasp13].some(
			(c) => c?.title.match(/Cingulum rest only|NO visible clasp|esthetic priority/i)
		);
		expect(anyEsthetic).toBe(true);
	});

	it('Direct retainers should include posterior reverse Akers recommendation', () => {
		const reverseAkers = result.clasps.find(
			(c) => c.title.match(/Reverse Akers/) && (c.title.includes('17') || c.title.includes('27'))
		);
		expect(reverseAkers).toBeDefined();
	});

	it('Esthetic strategy mentions reverse Akers AND clasps section should reflect it', () => {
		// Esthetic strategy mentions reverse Akers
		const estheticMentionsReverse = result.estheticStrategy.some((r) =>
			r.detail.match(/Reverse Akers|reverse circumferential/i)
		);
		expect(estheticMentionsReverse).toBe(true);

		// Clasps section also has reverse Akers (coordinated)
		const claspsHasReverse = result.clasps.some((c) => c.title.match(/Reverse Akers/));
		expect(claspsHasReverse).toBe(true);
	});

	it('Mouth prep should include posterior retainer teeth (17 and/or 27)', () => {
		// effective retainers = saddle abutments + posterior retainers (when esthetic)
		const allFdisInPrep = result.mouthPrep.flatMap((m) =>
			m.detail.match(/\d{2}/g) ?? []
		);
		const hasPosterior = allFdisInPrep.some((f) => f === '17' || f === '27');
		expect(hasPosterior).toBe(true);
	});

	it('Rests should include cingulum rests on anterior abutments (esthetic)', () => {
		const cingulumRest = result.rests.some((r) =>
			r.detail.match(/cingulum rest/i) && r.detail.match(/anterior/i)
		);
		expect(cingulumRest).toBe(true);
	});
});

describe('Cross-section coordination — posterior bounded (no esthetic concern)', () => {
	// Plain Class III posterior — esthetic strategy should NOT kick in
	function makeCase(): CaseData {
		const c = caseWithMissing([15, 16]);
		c.teeth[14].undercutDepthMm = 0.25;
		c.teeth[17].undercutDepthMm = 0.25;
		return c;
	}
	const data = makeCase();
	const cls = classifyKennedy('maxilla', data);
	const result = analyzeArch('maxilla', data, cls);

	it('Major connector for posterior-only Class III stays Single Palatal Strap', () => {
		expect(result.majorConnector.title).toMatch(/Single Palatal Strap/);
	});

	it('Direct retainer on posterior abutment 14 should use normal Akers (no esthetic override)', () => {
		const clasp14 = result.clasps.find((c) => c.title.includes('14'));
		expect(clasp14?.title).toMatch(/Akers|Circumferential/);
		expect(clasp14?.title).not.toMatch(/Cingulum rest only/);
	});

	it('Should NOT add posterior reverse Akers for posterior-only case', () => {
		const reverseAkers = result.clasps.find((c) =>
			c.title.match(/Reverse Akers \(esthetic alternative/)
		);
		expect(reverseAkers).toBeUndefined();
	});
});

describe('Mandible: anterior bounded → lingual plate not lingual bar', () => {
	// Missing 32, 41 (anterior mandibular)
	const data = caseWithMissing([32, 41]);
	const cls = classifyKennedy('mandible', data);
	const result = analyzeArch('mandible', data, cls);

	it('Mandibular major connector for Class III with anterior missing = Lingual Plate', () => {
		expect(result.majorConnector.title).toMatch(/Lingual Plate/);
	});
});
