<script lang="ts">
	import type { MaterialChoice } from '$lib/domain';

	interface Props {
		materials: MaterialChoice;
	}
	let { materials }: Props = $props();
</script>

<section class="card panel" aria-labelledby="materials-title">
	<header>
		<p class="eyebrow">Material Selection</p>
		<h3 id="materials-title">วัสดุที่แนะนำ</h3>
	</header>

	<div class="grid">
		<article class="block sev-{materials.framework.severity}">
			<p class="block-label">Framework</p>
			<h4>{materials.framework.title}</h4>
			<p class="block-detail">{materials.framework.detail}</p>
		</article>

		<article class="block sev-{materials.artificialTeeth.severity}">
			<p class="block-label">Artificial Teeth</p>
			<h4>{materials.artificialTeeth.title}</h4>
			<p class="block-detail">{materials.artificialTeeth.detail}</p>
		</article>

		<article class="block sev-{materials.denture.severity}">
			<p class="block-label">Denture Base</p>
			<h4>{materials.denture.title}</h4>
			<p class="block-detail">{materials.denture.detail}</p>
		</article>
	</div>

	{#if materials.framework.references.length}
		<footer class="refs">
			<p class="refs-label">อ้างอิง:</p>
			<ul>
				{#each materials.framework.references as ref (ref.source)}
					<li>
						<cite>{ref.source}</cite>{#if ref.page}<span> — {ref.page}</span>{/if}
					</li>
				{/each}
			</ul>
		</footer>
	{/if}
</section>

<style>
	.panel {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	header {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	.eyebrow {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	h3 {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-teal-800);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}
	@media (max-width: 800px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.block {
		padding: 0.75rem 0.875rem;
		border: 1px solid var(--color-line);
		border-radius: 0.5rem;
		background: var(--color-surface);
		border-inline-start: 3px solid var(--color-line);
	}
	.block-label {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-ink-muted);
		margin-bottom: 0.25rem;
	}
	h4 {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink);
		margin-bottom: 0.375rem;
	}
	.block-detail {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		line-height: 1.55;
	}
	.sev-good {
		border-inline-start-color: var(--color-teal-600);
	}
	.sev-warn {
		border-inline-start-color: var(--color-gold-400);
	}
	.sev-danger {
		border-inline-start-color: var(--color-coral-600);
	}
	.sev-info {
		border-inline-start-color: var(--color-teal-500);
	}
	.refs {
		border-top: 1px solid var(--color-line);
		padding-top: 0.5rem;
	}
	.refs-label {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-ink-muted);
		margin-bottom: 0.25rem;
	}
	.refs ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.refs li {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		line-height: 1.5;
	}
	cite {
		font-style: normal;
		font-weight: 500;
		color: var(--color-ink);
	}
</style>
