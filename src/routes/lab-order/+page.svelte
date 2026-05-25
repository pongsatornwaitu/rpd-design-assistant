<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { analyzeCase } from '$lib/domain';
	import ArchDiagram from '$lib/components/ArchDiagram.svelte';
	import { base } from '$app/paths';

	const analysis = $derived(analyzeCase(caseStore.current, settings.includeThirdMolars));
	const current = $derived(caseStore.current);
	const printable = $derived(new Date(current.meta.updatedAt).toLocaleString('th-TH'));

	function doPrint() {
		window.print();
	}
</script>

<svelte:head>
	<title>Lab Work Order — {current.meta.title}</title>
</svelte:head>

<header class="topbar no-print">
	<a href="{base}/" class="back">← กลับ</a>
	<button type="button" class="btn btn-primary" onclick={doPrint}>🖨 พิมพ์ / Save as PDF</button>
</header>

<main id="main" class="sheet">
	<div class="header-bar">
		<h1>RPD LAB WORK ORDER</h1>
		<div class="meta-block">
			<p><strong>เคส:</strong> {current.meta.title}</p>
			{#if current.meta.patient}
				<p><strong>ผู้ป่วย:</strong> {current.meta.patient}</p>
			{/if}
			<p><strong>วันที่:</strong> {printable}</p>
		</div>
	</div>

	<section class="section">
		<h2>1. Classification</h2>
		<div class="two-col">
			<div>
				<p class="label">Maxilla</p>
				<p class="value">{analysis.maxilla.classification.label}</p>
			</div>
			<div>
				<p class="label">Mandible</p>
				<p class="value">{analysis.mandible.classification.label}</p>
			</div>
		</div>
	</section>

	<section class="section">
		<h2>2. Diagram</h2>
		<div class="diagram">
			<ArchDiagram caseData={current} analysis={analysis.maxilla} />
			<hr />
			<ArchDiagram caseData={current} analysis={analysis.mandible} />
		</div>
		<p class="legend-text">
			● Abutment · ⊘ หายไป · ▲ Rest seat · ╌╌ Fulcrum line · ⊕ Indirect retainer position
		</p>
	</section>

	<section class="section">
		<h2>3. Major Connector</h2>
		<dl class="rec-grid">
			<div>
				<dt>Maxilla</dt>
				<dd>{analysis.maxilla.majorConnector.title}</dd>
			</div>
			<div>
				<dt>Mandible</dt>
				<dd>{analysis.mandible.majorConnector.title}</dd>
			</div>
		</dl>
	</section>

	{#if analysis.maxilla.clasps.length || analysis.mandible.clasps.length}
		<section class="section">
			<h2>4. Direct Retainers (Clasps)</h2>
			<table class="tbl">
				<thead>
					<tr><th>Arch</th><th>Tooth / Span</th><th>Design</th></tr>
				</thead>
				<tbody>
					{#each analysis.maxilla.clasps as c (c.title)}
						<tr>
							<td>U</td>
							<td>—</td>
							<td>{c.title}</td>
						</tr>
					{/each}
					{#each analysis.mandible.clasps as c (c.title)}
						<tr>
							<td>L</td>
							<td>—</td>
							<td>{c.title}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	{/if}

	{#if analysis.maxilla.rests.length || analysis.mandible.rests.length}
		<section class="section">
			<h2>5. Rest seats</h2>
			<table class="tbl">
				<thead><tr><th>Arch</th><th>Location</th></tr></thead>
				<tbody>
					{#each analysis.maxilla.rests as r (r.title)}
						<tr><td>U</td><td>{r.title}</td></tr>
					{/each}
					{#each analysis.mandible.rests as r (r.title)}
						<tr><td>L</td><td>{r.title}</td></tr>
					{/each}
				</tbody>
			</table>
		</section>
	{/if}

	{#if analysis.maxilla.indirectRetention.length || analysis.mandible.indirectRetention.length}
		<section class="section">
			<h2>6. Indirect Retainers</h2>
			<table class="tbl">
				<thead><tr><th>Arch</th><th>Specification</th></tr></thead>
				<tbody>
					{#each analysis.maxilla.indirectRetention as r (r.title)}
						<tr><td>U</td><td>{r.title}</td></tr>
					{/each}
					{#each analysis.mandible.indirectRetention as r (r.title)}
						<tr><td>L</td><td>{r.title}</td></tr>
					{/each}
				</tbody>
			</table>
		</section>
	{/if}

	<section class="section">
		<h2>7. Materials</h2>
		<dl class="rec-grid">
			<div>
				<dt>Framework</dt>
				<dd>{analysis.materials.framework.title}</dd>
			</div>
			<div>
				<dt>Artificial Teeth</dt>
				<dd>{analysis.materials.artificialTeeth.title}</dd>
			</div>
			<div>
				<dt>Denture Base</dt>
				<dd>{analysis.materials.denture.title}</dd>
			</div>
		</dl>
	</section>

	<section class="section">
		<h2>8. Path of Insertion</h2>
		<p class="value">
			Maxilla: {analysis.maxilla.poi.recommendedPath} ·
			Mandible: {analysis.mandible.poi.recommendedPath}
		</p>
	</section>

	<section class="section">
		<h2>9. Special Notes</h2>
		<ul class="notes">
			{#if current.patientFactors.bruxism}<li>Bruxism — rigid framework, no porcelain teeth</li>{/if}
			{#if current.patientFactors.metalAllergy !== 'none'}<li>Metal allergy: {current.patientFactors.metalAllergy}</li>{/if}
			{#if current.patientFactors.maxillaryTorus}<li>Torus palatinus — accommodate / relief connector</li>{/if}
			{#if current.patientFactors.mandibularTori}<li>Tori mandibularis — relief on connector</li>{/if}
			{#if current.patientFactors.salivaryFlow !== 'normal'}<li>Salivary flow: {current.patientFactors.salivaryFlow}</li>{/if}
		</ul>
	</section>

	<footer class="sig-block">
		<div class="sig">
			<p class="sig-label">Dentist signature</p>
			<div class="sig-line"></div>
		</div>
		<div class="sig">
			<p class="sig-label">Date</p>
			<div class="sig-line"></div>
		</div>
		<div class="sig">
			<p class="sig-label">Lab receipt</p>
			<div class="sig-line"></div>
		</div>
	</footer>

	<p class="disclaimer">
		Generated by RPD Design Assistant v2 — เครื่องมือช่วยตัดสินใจเพื่อการศึกษา
		ทันตแพทย์ผู้รักษาเป็นผู้ตัดสินใจสุดท้ายในแผนการรักษา
	</p>
</main>

<style>
	.topbar {
		display: flex;
		justify-content: space-between;
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
		align-items: center;
	}
	.back {
		font-size: 0.875rem;
		color: var(--color-teal-700);
		text-decoration: none;
	}
	.sheet {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		background: white;
		color: #0f172a;
		font-family: var(--font-sans);
		min-height: 100vh;
	}
	:global([data-theme='dark']) .sheet {
		background: white;
		color: #0f172a;
	}
	.header-bar {
		border-bottom: 2px solid #0f766e;
		padding-bottom: 1rem;
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
	}
	h1 {
		font-size: 1.375rem;
		font-weight: 700;
		color: #0f766e;
		letter-spacing: 0.05em;
	}
	.meta-block p {
		font-size: 0.8125rem;
		margin-bottom: 0.125rem;
	}
	.section {
		margin-bottom: 1.25rem;
		page-break-inside: avoid;
	}
	h2 {
		font-size: 0.875rem;
		font-weight: 700;
		color: #0f766e;
		border-bottom: 1px solid #cbd5e1;
		padding-bottom: 0.25rem;
		margin-bottom: 0.5rem;
	}
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.label {
		font-size: 0.6875rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.value {
		font-size: 0.875rem;
		font-weight: 600;
	}
	.diagram {
		border: 1px solid #cbd5e1;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}
	.diagram hr {
		border: 0;
		border-top: 1px dashed #cbd5e1;
		margin: 0.25rem 0;
	}
	.legend-text {
		font-size: 0.6875rem;
		color: #64748b;
		margin-top: 0.25rem;
	}
	.rec-grid {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 0.25rem 1rem;
	}
	.rec-grid div {
		display: contents;
	}
	dt {
		font-weight: 600;
		font-size: 0.8125rem;
		color: #475569;
	}
	dd {
		font-size: 0.8125rem;
		margin: 0;
	}
	.tbl {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	.tbl th,
	.tbl td {
		border: 1px solid #cbd5e1;
		padding: 0.375rem 0.5rem;
		text-align: left;
	}
	.tbl th {
		background: #f0fdfa;
		font-weight: 600;
		color: #0f766e;
	}
	.tbl td:first-child {
		width: 50px;
		text-align: center;
		font-weight: 600;
	}
	.notes {
		padding-inline-start: 1.25rem;
		font-size: 0.8125rem;
	}
	.notes li {
		margin-bottom: 0.25rem;
	}
	.sig-block {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 2rem;
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #cbd5e1;
	}
	.sig-label {
		font-size: 0.6875rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 1.5rem;
	}
	.sig-line {
		border-bottom: 1px solid #475569;
	}
	.disclaimer {
		margin-top: 1.5rem;
		font-size: 0.6875rem;
		color: #64748b;
		font-style: italic;
		text-align: center;
	}

	@media print {
		:global(body) {
			background: white !important;
		}
		.no-print {
			display: none !important;
		}
		.sheet {
			padding: 0.5cm;
			max-width: 100%;
			min-height: auto;
		}
		.section {
			page-break-inside: avoid;
		}
	}
</style>
