const STORAGE_KEY = 'rpd-v2:settings';

export type Theme = 'auto' | 'light' | 'dark';
export type Mode = 'learning' | 'practice';

interface Settings {
	theme: Theme;
	mode: Mode;
	includeThirdMolars: boolean;
}

function readStorage(): Settings {
	const fallback: Settings = { theme: 'auto', mode: 'learning', includeThirdMolars: false };
	if (typeof localStorage === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return fallback;
		return { ...fallback, ...JSON.parse(raw) };
	} catch {
		return fallback;
	}
}

function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;
	const effective =
		theme === 'auto'
			? window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
			: theme;
	document.documentElement.dataset.theme = effective;
}

function createSettings() {
	let state = $state<Settings>(readStorage());

	if (typeof window !== 'undefined') {
		applyTheme(state.theme);
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (state.theme === 'auto') applyTheme('auto');
		});
	}

	function persist() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		}
	}

	return {
		get theme() {
			return state.theme;
		},
		get mode() {
			return state.mode;
		},
		get includeThirdMolars() {
			return state.includeThirdMolars;
		},
		setTheme(t: Theme) {
			state.theme = t;
			applyTheme(t);
			persist();
		},
		setMode(m: Mode) {
			state.mode = m;
			persist();
		},
		toggleThirdMolars() {
			state.includeThirdMolars = !state.includeThirdMolars;
			persist();
		}
	};
}

export const settings = createSettings();
