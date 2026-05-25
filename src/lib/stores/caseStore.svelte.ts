import { emptyCase, type CaseData, type FDI, type ToothSurvey } from '$lib/types';
import { parseCase } from '$lib/schemas/caseSchema';

const STORAGE_KEY = 'rpd-v2:current-case';
const HISTORY_LIMIT = 50;

function readStorage(): CaseData | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return parseCase(JSON.parse(raw));
	} catch {
		return null;
	}
}

function writeStorage(data: CaseData) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		/* quota exceeded — swallow */
	}
}

function createCaseStore() {
	let state = $state<CaseData>(readStorage() ?? emptyCase());
	const past: CaseData[] = [];
	const future: CaseData[] = [];
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let lastSavedAt = $state<number | null>(null);

	function snapshot(): CaseData {
		return $state.snapshot(state) as CaseData;
	}

	function pushHistory() {
		past.push(snapshot());
		if (past.length > HISTORY_LIMIT) past.shift();
		future.length = 0;
	}

	function scheduleSave() {
		state.meta.updatedAt = new Date().toISOString();
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			writeStorage(snapshot());
			lastSavedAt = Date.now();
		}, 300);
	}

	return {
		get current() {
			return state;
		},
		get canUndo() {
			return past.length > 0;
		},
		get canRedo() {
			return future.length > 0;
		},
		get lastSavedAt() {
			return lastSavedAt;
		},
		setStatus(fdi: FDI, status: ToothSurvey['status']) {
			if (state.teeth[fdi].status === status) return;
			pushHistory();
			// Replace tooth object to ensure top-level proxy invalidation across all subscribers
			state.teeth[fdi] = { ...state.teeth[fdi], status };
			scheduleSave();
		},
		toggleStatus(fdi: FDI) {
			this.setStatus(fdi, state.teeth[fdi].status === 'present' ? 'missing' : 'present');
		},
		updateSurvey(fdi: FDI, patch: Partial<ToothSurvey>) {
			pushHistory();
			state.teeth[fdi] = { ...state.teeth[fdi], ...patch };
			scheduleSave();
		},
		setMeta(patch: Partial<CaseData['meta']>) {
			pushHistory();
			state.meta = { ...state.meta, ...patch };
			scheduleSave();
		},
		setPatientFactors(patch: Partial<CaseData['patientFactors']>) {
			pushHistory();
			state.patientFactors = { ...state.patientFactors, ...patch };
			scheduleSave();
		},
		setInterarch(patch: Partial<CaseData['interarch']>) {
			pushHistory();
			state.interarch = { ...state.interarch, ...patch };
			scheduleSave();
		},
		undo() {
			const prev = past.pop();
			if (!prev) return;
			future.push(snapshot());
			state = prev;
			scheduleSave();
		},
		redo() {
			const next = future.pop();
			if (!next) return;
			past.push(snapshot());
			state = next;
			scheduleSave();
		},
		reset() {
			pushHistory();
			state = emptyCase();
			scheduleSave();
		},
		load(data: CaseData) {
			pushHistory();
			state = data;
			scheduleSave();
		}
	};
}

export const caseStore = createCaseStore();
