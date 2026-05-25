<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import { MAXILLARY_FDI, MANDIBULAR_FDI, ALL_FDI, type FDI } from '$lib/types';
	import { settings } from '$lib/stores/settings.svelte';
	import ToothButton from './ToothButton.svelte';

	interface Props {
		selectedFdi: FDI | null;
		onSelect: (fdi: FDI) => void;
	}

	let { selectedFdi = $bindable(), onSelect }: Props = $props();

	const THIRD_MOLARS: ReadonlySet<FDI> = new Set([18, 28, 38, 48]);

	const visibleArchOrder = $derived.by(() => {
		if (settings.includeThirdMolars) return ALL_FDI;
		return ALL_FDI.filter((f) => !THIRD_MOLARS.has(f));
	});

	let focusFdi = $state<FDI | null>(null);
	let mode = $state<'edit' | 'mark'>('mark');

	const effectiveFocus = $derived(focusFdi ?? selectedFdi ?? visibleArchOrder[0]);

	// Snapshot pattern — guaranteed fresh on every state change
	const snap = $derived.by(() => {
		caseStore.revision;
		return caseStore.snapshot();
	});

	const upperRight = $derived(
		MAXILLARY_FDI.slice(0, 8).filter((f) => settings.includeThirdMolars || !THIRD_MOLARS.has(f))
	);
	const upperLeft = $derived(
		MAXILLARY_FDI.slice(8, 16).filter((f) => settings.includeThirdMolars || !THIRD_MOLARS.has(f))
	);
	const lowerLeft = $derived(
		MANDIBULAR_FDI.slice(8, 16).filter((f) => settings.includeThirdMolars || !THIRD_MOLARS.has(f))
	);
	const lowerRight = $derived(
		MANDIBULAR_FDI.slice(0, 8).filter((f) => settings.includeThirdMolars || !THIRD_MOLARS.has(f))
	);

	function activate(fdi: FDI, shiftKey: boolean) {
		// Mark mode (default): click = toggle missing; Shift+click = open survey
		// Edit mode: click = open survey; Shift+click = toggle missing
		const wantsToggle = mode === 'mark' ? !shiftKey : shiftKey;
		if (wantsToggle) caseStore.toggleStatus(fdi);
		else onSelect(fdi);
	}

	function handleClick(fdi: FDI, event: MouseEvent) {
		activate(fdi, event.shiftKey);
		focusFdi = fdi;
	}

	function handleKeydown(e: KeyboardEvent) {
		const current = focusFdi ?? selectedFdi ?? visibleArchOrder[0];
		const order = visibleArchOrder;
		const idx = order.indexOf(current);
		if (idx === -1) return;

		let nextIdx: number | null = null;
		const isUpper = current < 30;

		switch (e.key) {
			case 'ArrowRight':
				nextIdx = (idx + 1) % order.length;
				break;
			case 'ArrowLeft':
				nextIdx = (idx - 1 + order.length) % order.length;
				break;
			case 'ArrowDown':
			case 'ArrowUp': {
				const quadrant = Math.floor(current / 10);
				const tens = current % 10;
				let targetQuadrant: number;
				if (e.key === 'ArrowDown') {
					targetQuadrant = quadrant === 1 ? 4 : quadrant === 2 ? 3 : quadrant;
				} else {
					targetQuadrant = quadrant === 3 ? 2 : quadrant === 4 ? 1 : quadrant;
				}
				if (targetQuadrant !== quadrant) {
					const target = (targetQuadrant * 10 + tens) as FDI;
					nextIdx = order.indexOf(target);
					if (nextIdx === -1) nextIdx = null;
				} else if (e.key === 'ArrowDown' && isUpper) {
					nextIdx = order.findIndex((f) => f > 30);
				} else if (e.key === 'ArrowUp' && !isUpper) {
					nextIdx = order.findIndex((f) => f < 30);
				}
				break;
			}
			case 'Home':
				nextIdx = 0;
				break;
			case 'End':
				nextIdx = order.length - 1;
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				activate(current, e.shiftKey);
				return;
			case 'Delete':
			case 'Backspace':
				e.preventDefault();
				caseStore.toggleStatus(current);
				return;
			default:
				return;
		}

		if (nextIdx !== null) {
			e.preventDefault();
			focusFdi = order[nextIdx];
			requestAnimationFrame(() => {
				const el = document.querySelector<HTMLButtonElement>(`[data-fdi="${order[nextIdx!]}"]`);
				el?.focus();
			});
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
	class="card-raised chart"
	aria-labelledby="chart-title"
	role="group"
	onkeydown={handleKeydown}
>
	<header class="chart-header">
		<h2 id="chart-title" class="text-base font-semibold">แผนผังฟัน (FDI)</h2>
		<div class="mode-switch" role="group" aria-label="โหมดการคลิก">
			<button
				type="button"
				class="mode-btn"
				class:active={mode === 'mark'}
				aria-pressed={mode === 'mark'}
				onclick={() => (mode = 'mark')}
			>
				✗ Mark missing
			</button>
			<button
				type="button"
				class="mode-btn"
				class:active={mode === 'edit'}
				aria-pressed={mode === 'edit'}
				onclick={() => (mode = 'edit')}
			>
				✎ Edit survey
			</button>
		</div>
	</header>
	<p class="hint">
		{#if mode === 'mark'}
			<strong>คลิกฟัน = สลับ มี/หายไป</strong> • Shift+คลิก = เปิด survey • ลูกศร = เลื่อน
		{:else}
			<strong>คลิกฟัน = เปิด survey</strong> • Shift+คลิก หรือ Del = สลับ มี/หาย • ลูกศร = เลื่อน
		{/if}
	</p>

	<div class="quadrants" role="grid" aria-label="ฟันบน">
		<div class="quadrant right" role="row">
			{#each upperRight as fdi (fdi)}
				<div role="gridcell">
					<ToothButton
						{fdi}
						survey={snap.teeth[fdi]}
						focused={effectiveFocus === fdi}
						selected={selectedFdi === fdi}
						onclick={(e) => handleClick(fdi, e)}
					/>
				</div>
			{/each}
		</div>
		<div class="midline" aria-hidden="true"></div>
		<div class="quadrant left" role="row">
			{#each upperLeft as fdi (fdi)}
				<div role="gridcell">
					<ToothButton
						{fdi}
						survey={snap.teeth[fdi]}
						focused={effectiveFocus === fdi}
						selected={selectedFdi === fdi}
						onclick={(e) => handleClick(fdi, e)}
					/>
				</div>
			{/each}
		</div>
	</div>

	<div class="arch-divider" aria-hidden="true"></div>

	<div class="quadrants" role="grid" aria-label="ฟันล่าง">
		<div class="quadrant right" role="row">
			{#each lowerRight as fdi (fdi)}
				<div role="gridcell">
					<ToothButton
						{fdi}
						survey={snap.teeth[fdi]}
						focused={effectiveFocus === fdi}
						selected={selectedFdi === fdi}
						onclick={(e) => handleClick(fdi, e)}
					/>
				</div>
			{/each}
		</div>
		<div class="midline" aria-hidden="true"></div>
		<div class="quadrant left" role="row">
			{#each lowerLeft as fdi (fdi)}
				<div role="gridcell">
					<ToothButton
						{fdi}
						survey={snap.teeth[fdi]}
						focused={effectiveFocus === fdi}
						selected={selectedFdi === fdi}
						onclick={(e) => handleClick(fdi, e)}
					/>
				</div>
			{/each}
		</div>
	</div>

	<footer class="legend">
		<span class="legend-item"><i class="sw white"></i> ฟันที่มีอยู่</span>
		<span class="legend-item"><i class="sw striped"></i> ฟันที่หายไป</span>
		<span class="legend-item"><i class="sw concern"></i> ต้องระวัง</span>
		<span class="legend-item"><i class="sw dot gold"></i> Tipped</span>
		<span class="legend-item"><i class="sw dot coral"></i> Prognosis แย่</span>
	</footer>
</section>

<style>
	.chart {
		padding: 1rem;
	}
	.chart-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	.hint {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		margin-bottom: 0.5rem;
	}
	.hint strong {
		color: var(--color-teal-700);
		font-weight: 600;
	}
	.mode-switch {
		display: inline-flex;
		gap: 0.25rem;
		background: var(--color-surface);
		padding: 0.1875rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-line);
	}
	.mode-btn {
		padding: 0.3125rem 0.625rem;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		font-family: inherit;
	}
	.mode-btn:hover {
		color: var(--color-ink);
	}
	.mode-btn.active {
		background: var(--color-surface-raised);
		color: var(--color-ink);
		border-color: var(--color-line);
		box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
		font-weight: 600;
	}
	.quadrants {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.25rem;
	}
	.quadrant {
		display: flex;
		gap: 0.25rem;
	}
	.quadrant > * {
		flex: 1 1 0;
		min-width: 0;
	}
	.midline {
		width: 2px;
		align-self: stretch;
		background: var(--color-teal-600);
		opacity: 0.4;
		margin-inline: 0.25rem;
	}
	.arch-divider {
		height: 1px;
		background: var(--color-line);
		margin: 0.75rem 0;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.75rem;
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}
	.sw {
		display: inline-block;
		width: 0.875rem;
		height: 0.875rem;
		border-radius: 0.25rem;
		border: 1px solid var(--color-line);
		background: var(--color-surface-raised);
	}
	.sw.striped {
		background: repeating-linear-gradient(45deg, var(--color-line) 0 3px, transparent 3px 6px);
	}
	.sw.concern {
		background: var(--color-coral-100);
		border-color: var(--color-coral-500);
	}
	.sw.dot {
		border: none;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
	}
	.sw.gold {
		background: var(--color-gold-400);
	}
	.sw.coral {
		background: var(--color-coral-600);
	}

	@media (max-width: 520px) {
		.chart {
			padding: 0.75rem;
		}
	}
</style>
