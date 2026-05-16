import { createStore, get, set, del, values, keys } from 'idb-keyval';
import type { CaseData } from '$lib/types';

const store = typeof indexedDB !== 'undefined' ? createStore('rpd-v2', 'cases') : null;

export interface SavedCaseSummary {
	id: string;
	title: string;
	patient: string;
	updatedAt: string;
}

export async function listCases(): Promise<SavedCaseSummary[]> {
	if (!store) return [];
	const all = (await values(store)) as CaseData[];
	return all
		.map((c) => ({
			id: c.meta.id,
			title: c.meta.title,
			patient: c.meta.patient,
			updatedAt: c.meta.updatedAt
		}))
		.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveCase(data: CaseData): Promise<void> {
	if (!store) return;
	const plain = JSON.parse(JSON.stringify(data)) as CaseData;
	await set(plain.meta.id, plain, store);
}

export async function loadCase(id: string): Promise<CaseData | null> {
	if (!store) return null;
	return ((await get(id, store)) as CaseData | undefined) ?? null;
}

export async function deleteCase(id: string): Promise<void> {
	if (!store) return;
	await del(id, store);
}

export async function listIds(): Promise<string[]> {
	if (!store) return [];
	return (await keys(store)) as string[];
}
