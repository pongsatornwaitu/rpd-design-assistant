<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { analyzeCase, type CaseAnalysis } from '$lib/domain';
	import { emptyCase, type CaseData, type FDI } from '$lib/types';
	import TopBar from '$lib/components/TopBar.svelte';
	import ArchDiagram from '$lib/components/ArchDiagram.svelte';
	import { base } from '$app/paths';

	// Scenario A = current case (read-only mirror)
	// Scenario B = modified clone of current case
	let scenarioB = $state<CaseData>(JSON.parse(JSON.stringify(caseStore.current)));

	const analysisA = $derived.by(() => {
		caseStore.revision;
		return analyzeCase(caseStore.current, settings.includeThirdMolars);
	});
	const analysisB = $derived(analyzeCase(scenarioB, settings.includeThirdMolars));

	function syncFromCurrent() {
		scenarioB = JSON.parse(JSON.stringify(caseStore.current));
	}

	function toggleStatus(fdi: FDI) {
		scenarioB.teeth[fdi].status =
			scenarioB.teeth[fdi].status === 'present' ? 'missing' : 'present';
		scenarioB.meta.title = scenarioB.meta.title.replace(/\s\(scenario B\)$/, '') + ' (scenario B)';
	}

	function setUndercut(fdi: FDI, mm: number) {
		scenarioB.teeth[fdi].undercutDepthMm = mm;
	}

	function setVestibule(fdi: FDI, mm: number) {
		scenarioB.teeth[fdi].vestibuleMm = mm;
	}

	function toggleBruxism() {
		scenarioB.patientFactors.bruxism = !scenarioB.patientFactors.bruxism;
	}

	function setSalivary(v: 'normal' | 'reduced' | 'xerostomia') {
		scenarioB.patientFactors.salivaryFlow = v;
	}

	function diffSummary(a: CaseAnalysis, b: CaseAnalysis): string[] {
		const out: string[] = [];
		if (a.maxilla.classification.label !== b.maxilla.classification.label) {
			out.push(`Maxilla: ${a.maxilla.classification.label} → ${b.maxilla.classification.label}`);
		}
		if (a.mandible.classification.label !== b.mandible.classification.label) {
			out.push(
				`Mandible: ${a.mandible.classification.label} → ${b.mandible.classification.label}`
			);
		}
		if (a.maxilla.majorConnector.title !== b.maxilla.majorConnector.title) {
			out.push('Maxillary major connector แตกต่าง');
		}
		if (a.mandible.majorConnector.title !== b.mandible.majorConnector.title) {
			out.push('Mandibular major connector แตกต่าง');
		}
		if (a.materials.framework.title !== b.materials.framework.title) {
			out.push(`Framework: ${a.materials.framework.title} → ${b.materials.framework.title}`);
		}
		if (a.maxilla.clasps.length !== b.maxilla.clasps.length) {
			out.push(
				`Maxilla clasps: ${a.maxilla.clasps.length} → ${b.maxilla.clasps.length}`
			);
		}
		return out;
	}

	const diffs = $derived(diffSummary(analysisA, analysisB));
</script>

<svelte:head>
	<title>Compare scenarios — RPD Design</title>
</svelte:head>

<TopBar />

<main id="main" class="wrap">
	<div class="header-row">
		<a href="{base}/" class="back">← กลับหน้าหลัก</a>
		<h1>เปรียบเทียบ Scenario A vs B</h1>
		<button type="button" class="btn btn-ghost" onclick={syncFromCurrent}>
			🔄 Reset B จาก A
		</button>
	</div>

	<section class="card controls" aria-labelledby="ctrl-title">
		<h2 id="ctrl-title">เปลี่ยน parameter ใน Scenario B</h2>
		<p class="hint">
			แก้ Scenario B ได้ — Scenario A คือเคสปัจจุบันที่ใช้งานอยู่ (read-only ที่นี่)
		</p>

		<div class="quick-toggles">
			<button type="button" class="btn btn-ghost" onclick={toggleBruxism}>
				Bruxism: {scenarioB.patientFactors.bruxism ? '✓' : '✗'}
			</button>
			<div class="select-group">
				<span>Salivary:</span>
				<select
					value={scenarioB.patientFactors.salivaryFlow}
					onchange={(e) =>
						setSalivary((e.currentTarget as HTMLSelectElement).value as 'normal' | 'reduced' | 'xerostomia')}
				>
					<option value="normal">Normal</option>
					<option value="reduced">Reduced</option>
					<option value="xerostomia">Xerostomia</option>
				</select>
			</div>
		</div>

		<details>
			<summary>แก้ฟันเฉพาะซี่ (Scenario B)</summary>
			<div class="teeth-edit">
				{#each [11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27] as fdi (fdi)}
					<div class="tooth-row">
						<span class="fdi">{fdi}</span>
						<button
							type="button"
							class="mini-btn"
							class:active={scenarioB.teeth[fdi as FDI].status === 'missing'}
							onclick={() => toggleStatus(fdi as FDI)}
						>
							{scenarioB.teeth[fdi as FDI].status === 'missing' ? 'หาย' : 'มี'}
						</button>
						<label>
							<span>UC</span>
							<input
								type="number"
								step="0.25"
								min="0"
								max="2"
								value={scenarioB.teeth[fdi as FDI].undercutDepthMm}
								oninput={(e) =>
									setUndercut(fdi as FDI, parseFloat((e.currentTarget as HTMLInputElement).value) || 0)}
							/>
						</label>
						<label>
							<span>Vest</span>
							<input
								type="number"
								step="0.5"
								min="0"
								max="20"
								value={scenarioB.teeth[fdi as FDI].vestibuleMm}
								oninput={(e) =>
									setVestibule(fdi as FDI, parseFloat((e.currentTarget as HTMLInputElement).value) || 0)}
							/>
						</label>
					</div>
				{/each}
			</div>
		</details>
	</section>

	{#if diffs.length}
		<section class="diff-card" aria-label="ความแตกต่าง">
			<h2>🔀 ความแตกต่างที่พบ</h2>
			<ul>
				{#each diffs as d (d)}
					<li>{d}</li>
				{/each}
			</ul>
		</section>
	{:else}
		<p class="no-diff">เปลี่ยน parameter ใน Scenario B เพื่อดูความแตกต่าง</p>
	{/if}

	<div class="grid">
		<section class="card scenario">
			<header><h2>Scenario A (ปัจจุบัน)</h2></header>
			<ArchDiagram caseData={caseStore.current} analysis={analysisA.maxilla} />
			<ArchDiagram caseData={caseStore.current} analysis={analysisA.mandible} />
			<dl class="summary">
				<div>
					<dt>Maxilla class</dt>
					<dd>{analysisA.maxilla.classification.label}</dd>
				</div>
				<div>
					<dt>Mandible class</dt>
					<dd>{analysisA.mandible.classification.label}</dd>
				</div>
				<div>
					<dt>Max connector</dt>
					<dd>{analysisA.maxilla.majorConnector.title}</dd>
				</div>
				<div>
					<dt>Man connector</dt>
					<dd>{analysisA.mandible.majorConnector.title}</dd>
				</div>
				<div>
					<dt>Framework</dt>
					<dd>{analysisA.materials.framework.title}</dd>
				</div>
				<div>
					<dt>Clasps total</dt>
					<dd>{analysisA.maxilla.clasps.length + analysisA.mandible.clasps.length}</dd>
				</div>
			</dl>
		</section>

		<section class="card scenario scenario-b">
			<header><h2>Scenario B (what-if)</h2></header>
			<ArchDiagram caseData={scenarioB} analysis={analysisB.maxilla} />
			<ArchDiagram caseData={scenarioB} analysis={analysisB.mandible} />
			<dl class="summary">
				<div>
					<dt>Maxilla class</dt>
					<dd
						class:changed={analysisA.maxilla.classification.label !==
							analysisB.maxilla.classification.label}
					>
						{analysisB.maxilla.classification.label}
					</dd>
				</div>
				<div>
					<dt>Mandible class</dt>
					<dd
						class:changed={analysisA.mandible.classification.label !==
							analysisB.mandible.classification.label}
					>
						{analysisB.mandible.classification.label}
					</dd>
				</div>
				<div>
					<dt>Max connector</dt>
					<dd
						class:changed={analysisA.maxilla.majorConnector.title !==
							analysisB.maxilla.majorConnector.title}
					>
						{analysisB.maxilla.majorConnector.title}
					</dd>
				</div>
				<div>
					<dt>Man connector</dt>
					<dd
						class:changed={analysisA.mandible.majorConnector.title !==
							analysisB.mandible.majorConnector.title}
					>
						{analysisB.mandible.majorConnector.title}
					</dd>
				</div>
				<div>
					<dt>Framework</dt>
					<dd
						class:changed={analysisA.materials.framework.title !==
							analysisB.materials.framework.title}
					>
						{analysisB.materials.framework.title}
					</dd>
				</div>
				<div>
					<dt>Clasps total</dt>
					<dd
						class:changed={analysisA.maxilla.clasps.length + analysisA.mandible.clasps.length !==
							analysisB.maxilla.clasps.length + analysisB.mandible.clasps.length}
					>
						{analysisB.maxilla.clasps.length + analysisB.mandible.clasps.length}
					</dd>
				</div>
			</dl>
		</section>
	</div>
</main>

<style>
	.wrap {
		max-width: 1280px;
		margin: 0 auto;
		padding: 1rem;
	}
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}
	.back {
		font-size: 0.875rem;
		color: var(--color-teal-700);
		text-decoration: none;
	}
	h1 {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.controls {
		padding: 1rem;
		margin-bottom: 1rem;
	}
	.controls h2 {
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}
	.hint {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		margin-bottom: 0.75rem;
	}
	.quick-toggles {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 0.75rem;
	}
	.select-group {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
	}
	.select-group select {
		padding: 0.375rem 0.5rem;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 0.4375rem;
		color: var(--color-ink);
		font: inherit;
		font-size: 0.8125rem;
	}
	details summary {
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 0.5rem 0;
	}
	.teeth-edit {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.5rem;
		padding-top: 0.5rem;
	}
	.tooth-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		padding: 0.25rem;
		background: var(--color-surface);
		border-radius: 0.375rem;
	}
	.tooth-row .fdi {
		font-weight: 700;
		min-width: 1.5rem;
	}
	.mini-btn {
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		font-size: 0.6875rem;
		color: var(--color-ink);
		cursor: pointer;
	}
	.mini-btn.active {
		background: var(--color-coral-100);
		color: var(--color-coral-700);
		border-color: var(--color-coral-500);
	}
	.tooth-row input {
		width: 3rem;
		padding: 0.125rem 0.25rem;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		color: var(--color-ink);
	}
	.tooth-row label {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		color: var(--color-ink-muted);
	}
	.diff-card {
		background: var(--color-gold-100);
		border: 1px solid var(--color-gold-400);
		border-radius: 0.75rem;
		padding: 0.875rem 1rem;
		margin-bottom: 1rem;
	}
	.diff-card h2 {
		font-size: 0.875rem;
		font-weight: 700;
		margin-bottom: 0.375rem;
	}
	.diff-card ul {
		list-style: none;
		padding: 0;
		font-size: 0.8125rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.no-diff {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		font-style: italic;
		text-align: center;
		padding: 0.5rem;
		margin-bottom: 1rem;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	@media (max-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.scenario {
		padding: 1rem;
	}
	.scenario header {
		margin-bottom: 0.5rem;
		padding-bottom: 0.375rem;
		border-bottom: 1px solid var(--color-line);
	}
	.scenario h2 {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-teal-800);
	}
	.scenario-b h2 {
		color: var(--color-coral-700);
	}
	.summary {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.375rem 1rem;
		margin-top: 0.75rem;
	}
	.summary > div {
		display: grid;
		grid-template-columns: 100px 1fr;
		gap: 0.5rem;
		padding: 0.25rem 0;
		border-bottom: 1px dashed var(--color-line);
	}
	dt {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	dd {
		font-size: 0.8125rem;
		margin: 0;
	}
	dd.changed {
		background: var(--color-gold-100);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-weight: 600;
	}
</style>
