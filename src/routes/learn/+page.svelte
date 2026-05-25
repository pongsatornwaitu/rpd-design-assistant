<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { analyzeCase } from '$lib/domain';
	import ToothChart from '$lib/components/ToothChart.svelte';
	import SurveyEditor from '$lib/components/SurveyEditor.svelte';
	import ArchDiagram from '$lib/components/ArchDiagram.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import { base } from '$app/paths';
	import type { FDI } from '$lib/types';

	const analysis = $derived(analyzeCase(caseStore.current, settings.includeThirdMolars));

	let currentStep = $state(1);
	let selectedFdi = $state<FDI | null>(null);

	const steps = [
		{
			n: 1,
			title: 'Classify',
			subtitle: 'ระบุฟันที่หายไป + จัด Kennedy class',
			learn:
				'Kennedy classification (1925) — แบ่งตามตำแหน่ง edentulous area: Class I (bilateral distal extension), II (unilateral distal extension), III (bounded), IV (anterior crossing midline). Applegate\'s rules: most posterior area กำหนด class; ที่เหลือเป็น modifications.'
		},
		{
			n: 2,
			title: 'Survey abutments',
			subtitle: 'ประเมิน abutments ที่จะใช้',
			learn:
				'Survey แต่ละ abutment: undercut location/depth (gauge 0.25/0.5/0.75 mm), guide plane (proximal surface ขนานกับ path), vestibule depth, prognosis, crown:root ratio, mobility. Ante\'s law: root surface area ของ abutments ≥ pontics.'
		},
		{
			n: 3,
			title: 'Major Connector',
			subtitle: 'เลือก connector ตามอ้างอิงและ space',
			learn:
				'Maxilla: AP palatal strap (Class I/II), single strap (Class III), palatal plate (heavy load). Mandible: lingual bar ต้องการ vestibule ≥ 8 mm + interarch ≥ 6 mm; ถ้าไม่พอ ใช้ lingual plate.'
		},
		{
			n: 4,
			title: 'Direct Retainers',
			subtitle: 'เลือก clasp design per abutment',
			learn:
				'Bounded → Akers (cast circumferential), ใช้ undercut 0.25 mm. Distal extension terminal → RPI (Krol): mesial Rest + Proximal plate + I-bar. Tipped → RPA. Deep undercut > 0.5mm → wrought-wire. Esthetic anterior → rotational path / reverse Akers posterior.'
		},
		{
			n: 5,
			title: 'Indirect Retention',
			subtitle: 'ป้องกัน rotation ของ saddle',
			learn:
				'Class I/II: indirect retainer ANTERIOR ต่อ fulcrum line (mesial fossa ของ premolar/canine). Class IV: indirect retainer POSTERIOR ต่อ fulcrum (mesial fossa ของ molar). Class III: ไม่ต้องการ formal indirect retainer. ระยะ perpendicular = torque resistance.'
		},
		{
			n: 6,
			title: 'Rest seats',
			subtitle: 'เตรียม rest seat บน abutments',
			learn:
				'Occlusal rest: 1/3 mesiodistal × 1/2 buccolingual × 1-1.5 mm depth, saucer-shaped. Canine → cingulum rest (V-notch บน lingual cingulum). Incisor → incisal rest (last resort). Mesial rest ใน distal extension เพื่อ fulcrum line เคลื่อน mesial.'
		},
		{
			n: 7,
			title: 'Mouth Preparation',
			subtitle: 'ลำดับการเตรียมก่อน final impression',
			learn:
				'ลำดับ: (1) Extraction + perio (2) Endo eval (3) Ortho uprighting (4) Enameloplasty for supraerupted opposing (5) Surveyed crown (6) Guide plane prep (7) Rest seat prep (8) Undercut adjustment (9) Disocclusion check (10) Final impression.'
		},
		{
			n: 8,
			title: 'Materials',
			subtitle: 'เลือกวัสดุ framework, teeth, base',
			learn:
				'Framework: Co-Cr standard, Ti for allergy, CAD-CAM Co-Cr for esthetic precision, PEEK for multiple allergy. Teeth: cross-linked acrylic standard, layered composite for esthetic, ไม่ใช้ porcelain ใน bruxism. Base: heat-cured PMMA + soft liner ใน xerostomia.'
		}
	];

	const step = $derived(steps.find((s) => s.n === currentStep) ?? steps[0]);

	function next() {
		if (currentStep < steps.length) currentStep += 1;
	}
	function prev() {
		if (currentStep > 1) currentStep -= 1;
	}
</script>

<svelte:head>
	<title>Learn — RPD Step-by-Step</title>
</svelte:head>

<TopBar />

<main id="main" class="wrap">
	<div class="header-row">
		<a href="{base}/" class="back">← Free-form mode</a>
		<h1>โหมดเรียนรู้แบบขั้นตอน</h1>
	</div>

	<nav class="stepper" aria-label="Steps">
		{#each steps as s (s.n)}
			<button
				type="button"
				class="step-btn"
				class:active={currentStep === s.n}
				class:done={currentStep > s.n}
				onclick={() => (currentStep = s.n)}
			>
				<span class="step-n">{s.n}</span>
				<span class="step-t">{s.title}</span>
			</button>
		{/each}
	</nav>

	<article class="step-card">
		<header class="step-header">
			<p class="eyebrow">Step {step.n} / {steps.length}</p>
			<h2>{step.title}</h2>
			<p class="subtitle">{step.subtitle}</p>
		</header>

		<section class="learn-box" aria-label="หลักการ">
			<p class="learn-label">📚 หลักการ</p>
			<p class="learn-text">{step.learn}</p>
		</section>

		<section class="content">
			{#if step.n === 1}
				<ToothChart bind:selectedFdi onSelect={(fdi) => (selectedFdi = fdi)} />
				<div class="result-box">
					<p class="result-label">Classification</p>
					<p class="result-value">บน: {analysis.maxilla.classification.label}</p>
					<p class="result-value">ล่าง: {analysis.mandible.classification.label}</p>
				</div>
			{:else if step.n === 2 && selectedFdi !== null}
				<SurveyEditor fdi={selectedFdi} />
			{:else if step.n === 2}
				<div class="hint-box">
					กลับไป step 1 และเลือกฟันที่จะ survey
				</div>
			{:else if step.n === 3}
				<div class="result-box">
					<h3>Maxilla</h3>
					<p class="result-value">{analysis.maxilla.majorConnector.title}</p>
					<p class="result-detail">{analysis.maxilla.majorConnector.detail}</p>
					<h3>Mandible</h3>
					<p class="result-value">{analysis.mandible.majorConnector.title}</p>
					<p class="result-detail">{analysis.mandible.majorConnector.detail}</p>
				</div>
			{:else if step.n === 4}
				<div class="result-box">
					<h3>Maxilla clasps</h3>
					{#if analysis.maxilla.clasps.length}
						{#each analysis.maxilla.clasps as c (c.title)}
							<div class="mini">
								<p class="mini-t">{c.title}</p>
								<p class="mini-d" style="white-space: pre-wrap">{c.detail}</p>
							</div>
						{/each}
					{:else}<p class="hint-box">ไม่มี clasp recommendation</p>{/if}
					<h3>Mandible clasps</h3>
					{#if analysis.mandible.clasps.length}
						{#each analysis.mandible.clasps as c (c.title)}
							<div class="mini">
								<p class="mini-t">{c.title}</p>
								<p class="mini-d" style="white-space: pre-wrap">{c.detail}</p>
							</div>
						{/each}
					{:else}<p class="hint-box">ไม่มี clasp recommendation</p>{/if}
				</div>
			{:else if step.n === 5}
				<div class="diagrams">
					<ArchDiagram caseData={caseStore.current} analysis={analysis.maxilla} />
					<ArchDiagram caseData={caseStore.current} analysis={analysis.mandible} />
				</div>
				<div class="result-box">
					{#each [analysis.maxilla, analysis.mandible] as a (a.arch)}
						{#if a.indirectRetention.length}
							<h3>{a.arch === 'maxilla' ? 'Maxilla' : 'Mandible'}</h3>
							{#each a.indirectRetention as r (r.title)}
								<div class="mini">
									<p class="mini-t">{r.title}</p>
									<p class="mini-d" style="white-space: pre-wrap">{r.detail}</p>
								</div>
							{/each}
						{/if}
					{/each}
				</div>
			{:else if step.n === 6}
				<div class="result-box">
					{#each [analysis.maxilla, analysis.mandible] as a (a.arch)}
						{#if a.rests.length}
							<h3>{a.arch === 'maxilla' ? 'Maxilla' : 'Mandible'}</h3>
							{#each a.rests as r (r.title)}
								<div class="mini">
									<p class="mini-t">{r.title}</p>
									<p class="mini-d" style="white-space: pre-wrap">{r.detail}</p>
								</div>
							{/each}
						{/if}
					{/each}
				</div>
			{:else if step.n === 7}
				<div class="result-box">
					{#each [analysis.maxilla, analysis.mandible] as a (a.arch)}
						{#if a.mouthPrep.length}
							<h3>{a.arch === 'maxilla' ? 'Maxilla' : 'Mandible'} prep</h3>
							<ol class="prep-list">
								{#each a.mouthPrep as m (m.step)}
									<li>
										<strong>{m.step}</strong>
										<span>{m.detail}</span>
									</li>
								{/each}
							</ol>
						{/if}
					{/each}
				</div>
			{:else if step.n === 8}
				<div class="result-box">
					<div class="mini">
						<p class="mini-t">Framework: {analysis.materials.framework.title}</p>
						<p class="mini-d">{analysis.materials.framework.detail}</p>
					</div>
					<div class="mini">
						<p class="mini-t">Teeth: {analysis.materials.artificialTeeth.title}</p>
						<p class="mini-d">{analysis.materials.artificialTeeth.detail}</p>
					</div>
					<div class="mini">
						<p class="mini-t">Base: {analysis.materials.denture.title}</p>
						<p class="mini-d">{analysis.materials.denture.detail}</p>
					</div>
				</div>
			{/if}
		</section>

		<nav class="nav-row">
			<button type="button" class="btn btn-ghost" onclick={prev} disabled={currentStep === 1}>
				← ก่อนหน้า
			</button>
			<span class="counter">{currentStep} / {steps.length}</span>
			<button
				type="button"
				class="btn btn-primary"
				onclick={next}
				disabled={currentStep === steps.length}
			>
				ถัดไป →
			</button>
		</nav>
	</article>
</main>

<style>
	.wrap {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.back {
		font-size: 0.875rem;
		color: var(--color-teal-700);
		text-decoration: none;
	}
	h1 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-ink);
	}
	.stepper {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}
	.step-btn {
		flex: 1;
		min-width: 80px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.5rem;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	.step-btn.active {
		background: var(--color-teal-50);
		border-color: var(--color-teal-600);
		color: var(--color-teal-800);
		font-weight: 600;
	}
	.step-btn.done {
		background: var(--color-surface-raised);
		color: var(--color-teal-700);
	}
	.step-n {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background: var(--color-teal-700);
		color: white;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 700;
	}
	.step-btn.active .step-n {
		background: var(--color-teal-800);
	}
	.step-btn:not(.active):not(.done) .step-n {
		background: var(--color-line);
		color: var(--color-ink-muted);
	}
	.step-card {
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 0.75rem;
		padding: 1.25rem;
		box-shadow: var(--shadow-card);
	}
	.step-header {
		margin-bottom: 0.75rem;
	}
	.eyebrow {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-ink-muted);
	}
	h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-teal-800);
		margin-top: 0.25rem;
	}
	.subtitle {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
	}
	.learn-box {
		background: var(--color-teal-50);
		border-inline-start: 3px solid var(--color-teal-600);
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin-bottom: 1rem;
	}
	.learn-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-teal-800);
		margin-bottom: 0.25rem;
	}
	.learn-text {
		font-size: 0.8125rem;
		color: var(--color-ink);
		line-height: 1.6;
	}
	.content {
		margin-bottom: 1rem;
	}
	.result-box {
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 0.5rem;
		padding: 0.875rem;
	}
	.result-box h3 {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin: 0.75rem 0 0.375rem;
	}
	.result-box h3:first-child {
		margin-top: 0;
	}
	.result-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-ink);
		margin-bottom: 0.25rem;
	}
	.result-detail {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		line-height: 1.5;
		margin-bottom: 0.5rem;
	}
	.result-label {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-ink-muted);
		margin-bottom: 0.25rem;
	}
	.mini {
		padding: 0.5rem 0;
		border-top: 1px dashed var(--color-line);
	}
	.mini:first-child {
		border-top: none;
	}
	.mini-t {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink);
		margin-bottom: 0.25rem;
	}
	.mini-d {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		line-height: 1.5;
	}
	.hint-box {
		padding: 0.75rem;
		background: var(--color-gold-100);
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		text-align: center;
	}
	.diagrams {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--color-surface);
		padding: 0.5rem;
		border-radius: 0.5rem;
		margin-bottom: 0.75rem;
	}
	.prep-list {
		padding-inline-start: 1.25rem;
	}
	.prep-list li {
		font-size: 0.8125rem;
		margin-bottom: 0.375rem;
		line-height: 1.5;
	}
	.prep-list strong {
		font-weight: 600;
		color: var(--color-teal-800);
	}
	.prep-list span {
		color: var(--color-ink-muted);
		display: block;
		font-size: 0.75rem;
	}
	.nav-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		border-top: 1px solid var(--color-line);
		padding-top: 0.75rem;
	}
	.counter {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
