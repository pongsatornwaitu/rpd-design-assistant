<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import { analyzeCase } from '$lib/domain';
	import ArchDiagram from './ArchDiagram.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import SurveyEditor from './SurveyEditor.svelte';
	import { base } from '$app/paths';
	import type { FDI } from '$lib/types';

	const analysis = $derived.by(() => {
		caseStore.revision; // force re-evaluation on every state change
		return analyzeCase(caseStore.current);
	});
	const generatedAt = $derived(new Date(caseStore.current.meta.updatedAt).toLocaleString('th-TH'));

	let activeFdi = $state<FDI | null>(null);
	let interactive = $state(false);

	function onToothClick(fdi: FDI) {
		activeFdi = fdi;
	}
</script>

<article class="card sheet" aria-label="Design sheet">
	<header class="sheet-head">
		<div>
			<p class="eyebrow">Design Sheet</p>
			<h2>{caseStore.current.meta.title || 'เคสไม่มีชื่อ'}</h2>
			{#if caseStore.current.meta.patient}
				<p class="patient">ผู้ป่วย: {caseStore.current.meta.patient}</p>
			{/if}
		</div>
		<div class="sheet-meta">
			<p class="ts">อัปเดต: {generatedAt}</p>
			<div class="sheet-actions">
				<button
					type="button"
					class="btn btn-ghost"
					class:btn-primary={interactive}
					onclick={() => (interactive = !interactive)}
					aria-pressed={interactive}
				>
					{interactive ? '👆 Interactive' : '👆 เปิด interactive'}
				</button>
				<a href="{base}/lab-order" class="btn btn-ghost">📄 Lab order</a>
				<button type="button" class="btn btn-ghost" onclick={() => window.print()}>
					🖨 พิมพ์
				</button>
			</div>
		</div>
	</header>

	{#if interactive}
		<p class="hint-interactive">คลิกฟันบนแผนภาพเพื่อแก้ survey โดยตรง · Esc เพื่อปิด</p>
	{/if}

	<div class="diagram-wrap">
		<ArchDiagram
			caseData={caseStore.current}
			analysis={analysis.maxilla}
			{interactive}
			{onToothClick}
		/>
		<div class="midline-mark" aria-hidden="true"></div>
		<ArchDiagram
			caseData={caseStore.current}
			analysis={analysis.mandible}
			{interactive}
			{onToothClick}
		/>
	</div>

	<footer class="legend">
		<span><i class="sw teal"></i> Abutment</span>
		<span><i class="sw coral"></i> ต้องระวัง</span>
		<span><i class="sw missing"></i> หายไป</span>
		<span><i class="sw line"></i> Fulcrum line</span>
		<span><i class="sw tri"></i> Rest seat</span>
		<span><i class="sw ir"></i> Indirect retainer</span>
	</footer>
</article>

<BottomSheet
	open={activeFdi !== null}
	title={activeFdi !== null ? `ฟัน ${activeFdi}` : ''}
	onclose={() => (activeFdi = null)}
>
	{#if activeFdi !== null}
		<SurveyEditor fdi={activeFdi} />
	{/if}
</BottomSheet>

<style>
	.sheet {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.sheet-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.eyebrow {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.2;
	}
	.patient {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		margin-top: 0.25rem;
	}
	.sheet-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.375rem;
	}
	.ts {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	.sheet-actions {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}
	.hint-interactive {
		font-size: 0.75rem;
		color: var(--color-teal-700);
		padding: 0.5rem 0.75rem;
		background: var(--color-teal-50);
		border-inline-start: 3px solid var(--color-teal-600);
		border-radius: 0.375rem;
	}
	.diagram-wrap {
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border-radius: 0.75rem;
		padding: 0.5rem;
		gap: 0.25rem;
	}
	.midline-mark {
		height: 1px;
		background: var(--color-line);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.875rem;
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}
	.sw {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 999px;
		border: 1.5px solid var(--color-line);
	}
	.sw.teal {
		background: var(--color-teal-100);
		border-color: var(--color-teal-600);
	}
	.sw.coral {
		background: var(--color-coral-100);
		border-color: var(--color-coral-600);
	}
	.sw.missing {
		background: transparent;
		border-style: dashed;
		border-color: var(--color-ink-muted);
	}
	.sw.line {
		width: 1rem;
		height: 0;
		border: none;
		border-top: 2px dashed var(--color-gold-400);
		border-radius: 0;
	}
	.sw.tri {
		width: 0;
		height: 0;
		border: none;
		border-inline: 5px solid transparent;
		border-top: 8px solid var(--color-teal-700);
		border-radius: 0;
	}
	.sw.ir {
		background: transparent;
		border-style: dashed;
		border-color: var(--color-coral-500);
	}

	@media print {
		:global(body) {
			background: white !important;
		}
		.sheet {
			box-shadow: none;
			border: none;
		}
		button {
			display: none !important;
		}
	}
</style>
