import type { KnowledgeEntry } from '$lib/domain/knowledgeBase';
import { lookupKnowledge } from '$lib/domain/knowledgeBase';

function createKnowledgeStore() {
	let current = $state<KnowledgeEntry | null>(null);

	return {
		get current() {
			return current;
		},
		open(key: string) {
			const entry = lookupKnowledge(key);
			if (entry) current = entry;
		},
		close() {
			current = null;
		}
	};
}

export const knowledgeStore = createKnowledgeStore();
