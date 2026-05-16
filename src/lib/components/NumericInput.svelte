<script lang="ts">
	interface Preset {
		value: number;
		label: string;
		hint?: string;
	}

	interface Props {
		label: string;
		value: number;
		min?: number;
		max?: number;
		step?: number;
		unit?: string;
		presets?: Preset[];
		hint?: string;
		onchange: (v: number) => void;
	}

	let {
		label,
		value,
		min = 0,
		max = 100,
		step = 0.25,
		unit = 'mm',
		presets = [],
		hint,
		onchange
	}: Props = $props();

	function clamp(v: number): number {
		if (Number.isNaN(v)) return min;
		return Math.min(max, Math.max(min, v));
	}

	function handleInput(e: Event) {
		const raw = (e.currentTarget as HTMLInputElement).value;
		const n = parseFloat(raw);
		if (raw === '') {
			onchange(0);
			return;
		}
		onchange(clamp(n));
	}
</script>

<fieldset class="num-field">
	<legend class="num-label">
		{label}
		{#if hint}<span class="num-hint">{hint}</span>{/if}
	</legend>

	<div class="num-row">
		<input
			type="number"
			{min}
			{max}
			{step}
			{value}
			inputmode="decimal"
			oninput={handleInput}
			aria-label={`${label} (${unit})`}
		/>
		<span class="unit" aria-hidden="true">{unit}</span>
	</div>

	{#if presets.length}
		<div class="presets" role="group" aria-label="ค่ามาตรฐาน">
			{#each presets as p (p.value)}
				<button
					type="button"
					class="preset"
					class:active={value === p.value}
					onclick={() => onchange(p.value)}
					title={p.hint}
				>
					<span class="preset-value">{p.label}</span>
					{#if p.hint}<span class="preset-hint">{p.hint}</span>{/if}
				</button>
			{/each}
		</div>
	{/if}
</fieldset>

<style>
	.num-field {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
	.num-label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 0.375rem;
		padding: 0;
	}
	.num-hint {
		font-weight: 400;
		text-transform: none;
		letter-spacing: normal;
		font-size: 0.7rem;
	}
	.num-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	input[type='number'] {
		flex: 1;
		padding: 0.4375rem 0.625rem;
		border: 1px solid var(--color-line);
		border-radius: 0.4375rem;
		background: var(--color-surface-raised);
		font: inherit;
		font-size: 0.9375rem;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		color: var(--color-ink);
		min-width: 0;
	}
	input[type='number']:focus {
		border-color: var(--color-teal-600);
		outline: none;
	}
	.unit {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		font-weight: 500;
		min-width: 1.5rem;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.375rem;
	}
	.preset {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0;
		padding: 0.25rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		line-height: 1.2;
	}
	.preset:hover {
		border-color: var(--color-teal-600);
		color: var(--color-ink);
	}
	.preset.active {
		background: var(--color-teal-50);
		border-color: var(--color-teal-600);
		color: var(--color-teal-800);
	}
	.preset-value {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.preset-hint {
		font-size: 0.6875rem;
		opacity: 0.75;
	}
</style>
