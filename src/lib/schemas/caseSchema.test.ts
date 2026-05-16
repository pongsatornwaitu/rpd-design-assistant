import { describe, it, expect } from 'vitest';
import { parseCase } from './caseSchema';
import { emptyCase } from '$lib/types';

describe('parseCase — v2', () => {
	it('round-trips a fresh case', () => {
		const c = emptyCase();
		const json = JSON.parse(JSON.stringify(c));
		const parsed = parseCase(json);
		expect(parsed.meta.id).toBe(c.meta.id);
		expect(parsed.schemaVersion).toBe(2);
	});

	it('rejects malformed input', () => {
		expect(() => parseCase({ wat: true })).toThrow();
		expect(() => parseCase(null)).toThrow();
		expect(() => parseCase('not json')).toThrow();
	});

	it('rejects v2 with invalid enum value', () => {
		const c = emptyCase();
		const json = JSON.parse(JSON.stringify(c)) as ReturnType<typeof emptyCase>;
		(json.teeth[16].prognosis as string) = 'unknown';
		expect(() => parseCase(json)).toThrow();
	});
});

describe('parseCase — v1 migration', () => {
	it('migrates v1 remaining array to v2 missing teeth', () => {
		const v1 = {
			remaining: [
				18, 17, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 27, 28,
				48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
			],
			survey: { '16': { prognosis: 'poor' } },
			title: 'Old case'
		};
		const parsed = parseCase(v1);
		expect(parsed.teeth[16].status).toBe('missing');
		expect(parsed.teeth[26].status).toBe('missing');
		expect(parsed.teeth[15].status).toBe('present');
		expect(parsed.meta.title).toBe('Old case');
	});
});
