<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import ToothChart from '$lib/components/ToothChart.svelte';
	import SurveyEditor from '$lib/components/SurveyEditor.svelte';
	import AnalysisPanel from '$lib/components/AnalysisPanel.svelte';
	import DesignSheet from '$lib/components/DesignSheet.svelte';
	import CaseMetaForm from '$lib/components/CaseMetaForm.svelte';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import MaterialsPanel from '$lib/components/MaterialsPanel.svelte';
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { analyzeCase } from '$lib/domain';
	import type { FDI } from '$lib/types';
	import { onMount } from 'svelte';
	import { ALL_FDI } from '$lib/types';

	// Snapshot pattern: take plain JS snapshot tracked by revision
	// to bypass Svelte 5 deep-proxy nested-mutation reactivity quirks
	const snap = $derived.by(() => {
		caseStore.revision;
		return caseStore.snapshot();
	});

	const analysis = $derived(analyzeCase(snap, settings.includeThirdMolars));

	let selectedFdi = $state<FDI | null>(null);
	let isMobile = $state(false);

	const missingCount = $derived.by(() => {
		let n = 0;
		for (const fdi of ALL_FDI) {
			if (snap.teeth[fdi].status === 'missing') n++;
		}
		return n;
	});

	const concernCount = $derived.by(() => {
		let n = 0;
		for (const fdi of ALL_FDI) {
			const t = snap.teeth[fdi];
			if (t.status === 'present' && (t.prognosis === 'poor' || t.crownRoot === 'unfavorable' || t.tipped)) {
				n++;
			}
		}
		return n;
	});

	onMount(() => {
		const mq = window.matchMedia('(max-width: 880px)');
		const update = () => (isMobile = mq.matches);
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	function handleSelect(fdi: FDI) {
		selectedFdi = fdi;
	}

	function closeEditor() {
		selectedFdi = null;
	}
</script>

<TopBar />

<main id="main" class="layout">
	<div class="col-main">
		<CaseMetaForm />
		<ToothChart bind:selectedFdi onSelect={handleSelect} />

		<section class="card stats" aria-label="สรุปเคส">
			<div class="stat">
				<span class="stat-label">ฟันที่หายไป</span>
				<span class="stat-value">{missingCount}</span>
			</div>
			<div class="stat">
				<span class="stat-label">ฟันที่เหลือ</span>
				<span class="stat-value">{32 - missingCount}</span>
			</div>
			<div class="stat">
				<span class="stat-label">ต้องระวัง</span>
				<span class="stat-value" class:warn={concernCount > 0}>{concernCount}</span>
			</div>
			<div class="stat">
				<span class="stat-label">Kennedy ฟันบน</span>
				<span class="stat-value sm">{analysis.maxilla.classification.label.replace('Kennedy ', '')}</span>
			</div>
		</section>

		<DesignSheet />

		<div class="analyses">
			<AnalysisPanel analysis={analysis.maxilla} title="ขากรรไกรบน" />
			<AnalysisPanel analysis={analysis.mandible} title="ขากรรไกรล่าง" />
		</div>

		<MaterialsPanel materials={analysis.materials} />
	</div>

	{#if !isMobile}
		<aside class="col-side" aria-label="แก้ไขฟันที่เลือก">
			{#if selectedFdi !== null}
				<SurveyEditor fdi={selectedFdi} />
			{:else}
				<div class="card empty">
					<p class="empty-icon" aria-hidden="true">↖</p>
					<p class="empty-title">ยังไม่ได้เลือกฟัน</p>
					<p class="empty-body">
						แตะที่ฟันบนแผนผังเพื่อบันทึก survey<br />หรือ Shift+คลิก เพื่อทำเครื่องหมายว่าหายไป
					</p>
				</div>
			{/if}
		</aside>
	{/if}
</main>

{#if isMobile}
	<BottomSheet
		open={selectedFdi !== null}
		title={selectedFdi !== null ? `ฟัน ${selectedFdi}` : ''}
		onclose={closeEditor}
	>
		{#if selectedFdi !== null}
			<SurveyEditor fdi={selectedFdi} />
		{/if}
	</BottomSheet>
{/if}

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) min(420px, 38vw);
		gap: 1rem;
		padding: 1rem;
		max-width: 1400px;
		margin-inline: auto;
		align-items: start;
	}
	@media (max-width: 880px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	.col-main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}
	.col-side {
		position: sticky;
		top: 5rem;
		min-width: 0;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		padding: 1rem;
		gap: 0.5rem;
	}
	@media (max-width: 480px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem 0.75rem;
	}
	.stat + .stat {
		border-inline-start: 1px solid var(--color-line);
	}
	@media (max-width: 480px) {
		.stat + .stat {
			border-inline-start: none;
		}
		.stat:nth-child(3),
		.stat:nth-child(4) {
			border-top: 1px solid var(--color-line);
			padding-top: 0.75rem;
		}
	}
	.stat-label {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--color-teal-700);
		line-height: 1.1;
	}
	.stat-value.warn {
		color: var(--color-coral-600);
	}
	.stat-value.sm {
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.analyses {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	@media (max-width: 700px) {
		.analyses {
			grid-template-columns: 1fr;
		}
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 0.375rem;
		padding: 2.5rem 1.25rem;
	}
	.empty-icon {
		font-size: 2rem;
		color: var(--color-teal-600);
		line-height: 1;
	}
	.empty-title {
		font-weight: 600;
		font-size: 1rem;
	}
	.empty-body {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		line-height: 1.5;
	}
</style>
