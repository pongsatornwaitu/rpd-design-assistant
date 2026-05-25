<script lang="ts">
	import type { ArchAnalysis } from '$lib/domain';
	import { settings } from '$lib/stores/settings.svelte';
	import { knowledgeStore } from '$lib/stores/knowledgeStore.svelte';

	interface Props {
		analysis: ArchAnalysis;
		title: string;
	}
	let { analysis, title }: Props = $props();
	const showRationale = $derived(settings.mode === 'learning');

	const hasContent = $derived(
		analysis.spans.length > 0 || analysis.classification.className !== 'none'
	);

	/** Detect knowledge key from a recommendation title */
	function knowledgeKeyOf(title: string): string | null {
		const t = title.toLowerCase();
		if (t.includes('rpi')) return 'rpi';
		if (t.includes('akers') || t.includes('circumferential')) return 'akers';
		if (t.includes('indirect retainer')) return 'indirect-retention';
		if (t.includes("ante")) return 'antes-law';
		if (t.includes('rotational')) return 'rotational-path';
		if (t.includes('major connector') || t.includes('palatal') || t.includes('lingual bar') || t.includes('lingual plate')) return 'major-connector';
		return null;
	}
</script>

<section class="card panel" aria-labelledby="ap-{analysis.arch}">
	<header class="panel-header">
		<div>
			<p class="eyebrow">{title}</p>
			<h3 id="ap-{analysis.arch}" class="kennedy">{analysis.classification.label}</h3>
		</div>
		{#if analysis.classification.className !== 'none'}
			<span class="badge badge-{analysis.classification.className.toLowerCase()}">
				Class {analysis.classification.className}
			</span>
		{/if}
	</header>

	{#if analysis.classification.reason && showRationale}
		<p class="reason">
			<span class="reason-label">เหตุผล:</span>
			{analysis.classification.reason}
		</p>
	{/if}

	{#if hasContent}
		<div class="recs">
			<details open>
				<summary>🦷 Major Connector</summary>
				{#if true}
					{@const k = knowledgeKeyOf(analysis.majorConnector.title)}
					<div class="rec sev-{analysis.majorConnector.severity}">
						<h4>{analysis.majorConnector.title}</h4>
						<p>{analysis.majorConnector.detail}</p>
						{#if k}
							<button type="button" class="learn-btn" onclick={() => knowledgeStore.open(k)}>
								📚 อ่านเพิ่ม
							</button>
						{/if}
					</div>
				{/if}
			</details>

			{#if analysis.clasps.length}
				<details>
					<summary>🔗 Direct Retainers / Clasps ({analysis.clasps.length})</summary>
					<ul class="rec-list">
						{#each analysis.clasps as r (r.title)}
							{@const k = knowledgeKeyOf(r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p style="white-space: pre-wrap">{r.detail}</p>
								{#if k}
									<button type="button" class="learn-btn" onclick={() => knowledgeStore.open(k)}>
										📚 อ่านเพิ่ม
									</button>
								{/if}
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.specializedClasps.length}
				<details>
					<summary>⚡ Specialized Clasps ({analysis.specializedClasps.length})</summary>
					<ul class="rec-list">
						{#each analysis.specializedClasps as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p style="white-space: pre-wrap">{r.detail}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.crossArch.length}
				<details open>
					<summary>⇄ Cross-arch Stabilization ({analysis.crossArch.length})</summary>
					<ul class="rec-list">
						{#each analysis.crossArch as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p style="white-space: pre-wrap">{r.detail}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.pathOfInsertion.length}
				<details>
					<summary>↔ Path of Insertion</summary>
					<ul class="rec-list">
						{#each analysis.pathOfInsertion as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p style="white-space: pre-wrap">{r.detail}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.rests.length}
				<details>
					<summary>⚓ Rest seats ({analysis.rests.length})</summary>
					<ul class="rec-list">
						{#each analysis.rests as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p style="white-space: pre-wrap">{r.detail}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.indirectRetention.length}
				<details open>
					<summary>↺ Indirect Retention ({analysis.indirectRetention.length})</summary>
					<ul class="rec-list">
						{#each analysis.indirectRetention as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p style="white-space: pre-wrap">{r.detail}</p>
								<button
									type="button"
									class="learn-btn"
									onclick={() => knowledgeStore.open('indirect-retention')}
								>
									📚 อ่านเพิ่ม
								</button>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.estheticStrategy.length}
				<details open>
					<summary>✨ Esthetic Strategy ({analysis.estheticStrategy.length})</summary>
					<ul class="rec-list">
						{#each analysis.estheticStrategy as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p style="white-space: pre-wrap">{r.detail}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.interarchConcerns.length}
				<details open>
					<summary>↕ Interarch Space ({analysis.interarchConcerns.length})</summary>
					<ul class="rec-list">
						{#each analysis.interarchConcerns as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p style="white-space: pre-wrap">{r.detail}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if showRationale}
				<details>
					<summary>📐 Ante's Law — Abutment Capacity</summary>
					<div class="rec sev-{analysis.anteCheck.violated ? 'danger' : 'info'}">
						<h4>{analysis.anteCheck.finding}</h4>
						<p>{analysis.anteCheck.implication}</p>
						<p class="metric">
							Abutment area: {analysis.anteCheck.abutmentArea.toFixed(0)} mm² ·
							Pontic area: {analysis.anteCheck.pontifArea.toFixed(0)} mm²
						</p>
						<button
							type="button"
							class="learn-btn"
							onclick={() => knowledgeStore.open('antes-law')}
						>
							📚 อ่านเพิ่ม
						</button>
					</div>
				</details>
			{/if}

			{#if analysis.mouthPrep.length}
				<details>
					<summary>🛠 Mouth Preparation ({analysis.mouthPrep.length} ขั้น)</summary>
					<ol class="prep-list">
						{#each analysis.mouthPrep as m, i (m.step + i)}
							<li class="prep sev-{m.priority === 'high' ? 'danger' : m.priority === 'medium' ? 'warn' : 'info'}">
								<h4>{m.step}</h4>
								<p>{m.detail}</p>
							</li>
						{/each}
					</ol>
				</details>
			{/if}

			{#if analysis.concerns.length}
				<details open>
					<summary>⚠ ข้อควรระวัง ({analysis.concerns.length})</summary>
					<ul class="rec-list">
						{#each analysis.concerns as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p>{r.detail}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.classification.references.length}
				<details>
					<summary>📚 อ้างอิง</summary>
					<ul class="refs">
						{#each analysis.classification.references as ref (ref.source)}
							<li>
								<cite>{ref.source}</cite>
								{#if ref.page}<span class="ref-page"> — {ref.page}</span>{/if}
							</li>
						{/each}
					</ul>
				</details>
			{/if}
		</div>
	{:else}
		<p class="empty-note">ไม่มี edentulous area ในซี่ฟันนี้</p>
	{/if}
</section>

<style>
	.panel {
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.eyebrow {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 0.125rem;
	}
	.kennedy {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-teal-800);
	}
	.badge {
		padding: 0.25rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		background: var(--color-teal-50);
		color: var(--color-teal-800);
	}
	.badge-i {
		background: var(--color-coral-100);
		color: var(--color-coral-700);
	}
	.badge-ii {
		background: var(--color-gold-100);
		color: var(--color-gold-600);
	}
	.badge-iii {
		background: var(--color-teal-50);
		color: var(--color-teal-700);
	}
	.badge-iv {
		background: #ede9fe;
		color: #5b21b6;
	}
	.reason {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		line-height: 1.5;
		padding: 0.625rem 0.75rem;
		background: var(--color-surface);
		border-radius: 0.5rem;
		border-inline-start: 3px solid var(--color-teal-600);
	}
	.reason-label {
		font-weight: 600;
		color: var(--color-ink);
	}
	.recs {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	details {
		border: 1px solid var(--color-line);
		border-radius: 0.5rem;
		background: var(--color-surface-raised);
		overflow: hidden;
	}
	summary {
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink);
		background: var(--color-surface);
		user-select: none;
	}
	summary:hover {
		background: var(--color-teal-50);
	}
	details[open] summary {
		border-bottom: 1px solid var(--color-line);
	}
	.rec-list,
	.prep-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.prep-list {
		counter-reset: prep;
		padding: 0;
	}
	.prep {
		position: relative;
		padding: 0.625rem 0.75rem 0.625rem 2.25rem;
		border-inline-start: 3px solid var(--color-line);
		counter-increment: prep;
	}
	.prep::before {
		content: counter(prep);
		position: absolute;
		left: 0.5rem;
		top: 0.625rem;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 999px;
		background: var(--color-teal-700);
		color: white;
		font-size: 0.6875rem;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.prep + .prep {
		border-top: 1px solid var(--color-line);
	}
	.rec {
		padding: 0.625rem 0.75rem;
		border-inline-start: 3px solid var(--color-line);
	}
	.rec + .rec {
		border-top: 1px solid var(--color-line);
	}
	.rec h4,
	.prep h4 {
		font-size: 0.8125rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: var(--color-ink);
	}
	.rec p,
	.prep p {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		line-height: 1.5;
	}
	.metric {
		font-size: 0.75rem !important;
		font-variant-numeric: tabular-nums;
		margin-top: 0.375rem;
		opacity: 0.85;
	}
	.sev-good {
		border-inline-start-color: var(--color-teal-600);
	}
	.sev-warn {
		border-inline-start-color: var(--color-gold-400);
		background: var(--color-gold-100);
	}
	.sev-danger {
		border-inline-start-color: var(--color-coral-600);
		background: var(--color-coral-100);
	}
	.sev-info {
		border-inline-start-color: var(--color-teal-500);
	}
	.refs {
		list-style: none;
		padding: 0.5rem 0.75rem;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.refs li {
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--color-ink-muted);
	}
	.refs cite {
		font-style: normal;
		font-weight: 500;
		color: var(--color-ink);
	}
	.ref-page {
		font-style: italic;
	}
	.empty-note {
		padding: 1rem;
		text-align: center;
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		font-style: italic;
	}
	.learn-btn {
		margin-top: 0.5rem;
		padding: 0.25rem 0.625rem;
		background: var(--color-teal-50);
		border: 1px solid var(--color-teal-600);
		border-radius: 999px;
		font-size: 0.6875rem;
		color: var(--color-teal-800);
		cursor: pointer;
		font-family: inherit;
	}
	.learn-btn:hover {
		background: var(--color-teal-100);
	}
</style>
