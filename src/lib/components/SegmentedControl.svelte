<script lang="ts" generics="T extends string">
	interface Option<V extends string> {
		value: V;
		label: string;
		tone?: 'neutral' | 'warn' | 'danger' | 'good';
	}

	interface Props {
		label: string;
		value: T;
		options: Option<T>[];
		onchange: (value: T) => void;
		hint?: string;
		id?: string;
	}

	let { label, value, options, onchange, hint, id }: Props = $props();

	const groupId = $derived(id ?? `seg-${Math.random().toString(36).slice(2, 8)}`);
</script>

<fieldset class="seg-field">
	<legend class="seg-label">
		{label}
		{#if hint}<span class="seg-hint">{hint}</span>{/if}
	</legend>
	<div class="seg" role="radiogroup" aria-label={label}>
		{#each options as opt (opt.value)}
			<button
				type="button"
				role="radio"
				aria-checked={value === opt.value}
				class="seg-btn"
				class:selected={value === opt.value}
				data-tone={opt.tone ?? 'neutral'}
				id={`${groupId}-${opt.value}`}
				onclick={() => onchange(opt.value)}
			>
				{opt.label}
			</button>
		{/each}
	</div>
</fieldset>

<style>
	.seg-field {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
	.seg-label {
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
	.seg-hint {
		font-weight: 400;
		text-transform: none;
		letter-spacing: normal;
		font-size: 0.7rem;
	}
	.seg {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		padding: 0.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 0.625rem;
	}
	.seg-btn {
		flex: 1 1 auto;
		min-width: 3rem;
		padding: 0.4375rem 0.625rem;
		border: 1px solid transparent;
		border-radius: 0.4375rem;
		background: transparent;
		color: var(--color-ink-muted);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			color 120ms ease,
			border-color 120ms ease;
		touch-action: manipulation;
		white-space: nowrap;
	}
	.seg-btn:hover {
		color: var(--color-ink);
		background: white;
	}
	.seg-btn.selected {
		background: white;
		color: var(--color-ink);
		border-color: var(--color-line);
		box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
	}
	.seg-btn.selected[data-tone='warn'] {
		color: var(--color-gold-600);
		border-color: var(--color-gold-400);
		background: var(--color-gold-100);
	}
	.seg-btn.selected[data-tone='danger'] {
		color: var(--color-coral-700);
		border-color: var(--color-coral-500);
		background: var(--color-coral-100);
	}
	.seg-btn.selected[data-tone='good'] {
		color: var(--color-teal-800);
		border-color: var(--color-teal-600);
		background: var(--color-teal-50);
	}
</style>
