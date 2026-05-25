<script lang="ts">
	import type { FDI, ToothSurvey } from '$lib/types';

	interface Props {
		fdi: FDI;
		survey: ToothSurvey;
		focused: boolean;
		selected: boolean;
		onclick: (event: MouseEvent) => void;
	}

	let { fdi, survey, focused, selected, onclick }: Props = $props();

	const missing = $derived(survey.status === 'missing');
	const concern = $derived(
		survey.status === 'present' &&
			(survey.prognosis === 'poor' ||
				survey.crownRoot === 'unfavorable' ||
				survey.tipped)
	);
</script>

<button
	type="button"
	{onclick}
	tabindex={focused ? 0 : -1}
	data-fdi={fdi}
	aria-pressed={selected}
	aria-label={`ฟัน ${fdi} - ${missing ? 'หายไป' : 'มีอยู่'}${selected ? ' (เลือกอยู่)' : ''}`}
	class="tooth"
	class:missing
	class:concern
	class:selected
>
	<span class="fdi">{fdi}</span>
	{#if missing}
		<span class="x-mark" aria-hidden="true">✗</span>
	{/if}
	{#if survey.tipped}
		<span class="dot dot-tipped" aria-hidden="true"></span>
	{/if}
	{#if survey.prognosis === 'poor'}
		<span class="dot dot-poor" aria-hidden="true"></span>
	{/if}
</button>

<style>
	.tooth {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		min-height: 2.75rem;
		padding: 0.25rem;
		border: 2px solid var(--color-line);
		border-radius: var(--radius-tooth);
		background: white;
		color: var(--color-ink);
		font-size: 0.8125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			transform 80ms ease,
			color 120ms ease,
			box-shadow 120ms ease;
		touch-action: manipulation;
	}
	:global([data-theme='dark']) .tooth {
		background: var(--color-surface-raised);
	}
	.tooth:hover {
		border-color: var(--color-teal-600);
		background: var(--color-teal-50);
	}
	.tooth:active {
		transform: scale(0.96);
	}
	.tooth.missing {
		background: repeating-linear-gradient(
			45deg,
			var(--color-line) 0 4px,
			transparent 4px 8px
		);
		color: var(--color-ink-muted);
		border-style: dashed;
		border-color: var(--color-ink-muted);
	}
	.tooth.concern {
		border-color: var(--color-coral-500);
		background: var(--color-coral-100);
		color: var(--color-coral-700);
	}
	.tooth.selected {
		box-shadow:
			0 0 0 2px var(--color-teal-600),
			0 4px 8px rgb(15 23 42 / 0.1);
		border-color: var(--color-teal-600);
	}
	.fdi {
		line-height: 1;
	}
	.x-mark {
		position: absolute;
		font-size: 1.875rem;
		font-weight: 700;
		color: var(--color-coral-600);
		opacity: 0.6;
		line-height: 1;
		pointer-events: none;
		transform: translateY(-1px);
	}
	.tooth.missing .fdi {
		opacity: 0.6;
	}
	.dot {
		position: absolute;
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 999px;
	}
	.dot-tipped {
		bottom: 0.2rem;
		right: 0.2rem;
		background: var(--color-gold-400);
	}
	.dot-poor {
		bottom: 0.2rem;
		left: 0.2rem;
		background: var(--color-coral-600);
	}
</style>
