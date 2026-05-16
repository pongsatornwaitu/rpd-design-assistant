<script lang="ts">
	import type { ArchAnalysis } from '$lib/domain';
	import { settings } from '$lib/stores/settings.svelte';

	interface Props {
		analysis: ArchAnalysis;
		title: string;
	}
	let { analysis, title }: Props = $props();
	const showRationale = $derived(settings.mode === 'learning');

	const hasContent = $derived(
		analysis.spans.length > 0 || analysis.classification.className !== 'none'
	);
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
				<summary>Major Connector</summary>
				<div class="rec sev-{analysis.majorConnector.severity}">
					<h4>{analysis.majorConnector.title}</h4>
					<p>{analysis.majorConnector.detail}</p>
				</div>
			</details>

			{#if analysis.clasps.length}
				<details>
					<summary>Clasps ({analysis.clasps.length})</summary>
					<ul class="rec-list">
						{#each analysis.clasps as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p>{r.detail}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if analysis.rests.length}
				<details>
					<summary>Rests ({analysis.rests.length})</summary>
					<ul class="rec-list">
						{#each analysis.rests as r (r.title)}
							<li class="rec sev-{r.severity}">
								<h4>{r.title}</h4>
								<p>{r.detail}</p>
							</li>
						{/each}
					</ul>
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
					<summary>📚 อ้างอิง ({analysis.classification.references.length})</summary>
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
		background: white;
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
	.rec-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.rec {
		padding: 0.625rem 0.75rem;
		border-inline-start: 3px solid var(--color-line);
	}
	.rec + .rec {
		border-top: 1px solid var(--color-line);
	}
	.rec h4 {
		font-size: 0.8125rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: var(--color-ink);
	}
	.rec p {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		line-height: 1.5;
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
</style>
