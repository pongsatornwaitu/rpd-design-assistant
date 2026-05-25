<script lang="ts">
	import type { KnowledgeEntry } from '$lib/domain/knowledgeBase';
	import { onMount } from 'svelte';

	interface Props {
		entry: KnowledgeEntry | null;
		onclose: () => void;
	}
	let { entry, onclose }: Props = $props();

	onMount(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onclose();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

{#if entry}
	<div
		class="backdrop"
		role="presentation"
		onclick={onclose}
		onkeydown={(e) => e.key === 'Enter' && onclose()}
		tabindex="-1"
	></div>
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="kb-title">
		<header class="kb-header">
			<div>
				<p class="eyebrow">📚 Knowledge Base</p>
				<h2 id="kb-title">{entry.title}</h2>
			</div>
			<button type="button" class="close" onclick={onclose} aria-label="ปิด">✕</button>
		</header>

		<div class="kb-body">
			<p class="summary">{entry.summary}</p>

			<section>
				<h3>รายละเอียด</h3>
				{#each entry.body as para (para)}
					<p class="para" style="white-space: pre-wrap">{para}</p>
				{/each}
			</section>

			{#if entry.clinicalPearls.length}
				<section>
					<h3>💎 Clinical Pearls</h3>
					<ul class="pearls">
						{#each entry.clinicalPearls as pearl (pearl)}
							<li>{pearl}</li>
						{/each}
					</ul>
				</section>
			{/if}

			<section>
				<h3>อ้างอิง</h3>
				<ul class="cites">
					{#each entry.citations as c (c)}
						<li>{c}</li>
					{/each}
				</ul>
			</section>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgb(15 23 42 / 0.5);
		backdrop-filter: blur(3px);
		z-index: 150;
		animation: fadeIn 160ms ease;
	}
	.modal {
		position: fixed;
		top: 5%;
		left: 50%;
		transform: translateX(-50%);
		max-width: 720px;
		width: calc(100% - 2rem);
		max-height: 90vh;
		overflow-y: auto;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 1rem;
		box-shadow: var(--shadow-card-raised);
		z-index: 160;
		animation: slideDown 220ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.kb-header {
		position: sticky;
		top: 0;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: var(--color-surface-raised);
		border-bottom: 1px solid var(--color-line);
		z-index: 1;
	}
	.eyebrow {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-teal-700);
		margin-bottom: 0.125rem;
	}
	h2 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.3;
	}
	.close {
		background: transparent;
		border: none;
		font-size: 1.25rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
	}
	.close:hover {
		background: var(--color-surface);
		color: var(--color-ink);
	}
	.kb-body {
		padding: 1rem 1.25rem 1.5rem;
	}
	.summary {
		font-size: 0.9375rem;
		color: var(--color-ink);
		line-height: 1.6;
		padding: 0.75rem 0.875rem;
		background: var(--color-teal-50);
		border-inline-start: 3px solid var(--color-teal-600);
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}
	section {
		margin-bottom: 1.25rem;
	}
	h3 {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-teal-800);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-line);
		padding-bottom: 0.25rem;
	}
	.para {
		font-size: 0.875rem;
		color: var(--color-ink);
		line-height: 1.65;
		margin-bottom: 0.625rem;
	}
	.pearls {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.pearls li {
		font-size: 0.875rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-gold-100);
		border-inline-start: 3px solid var(--color-gold-400);
		border-radius: 0.375rem;
		color: var(--color-ink);
		line-height: 1.5;
	}
	.cites {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.cites li {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		font-style: italic;
		line-height: 1.5;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes slideDown {
		from {
			transform: translate(-50%, -10px);
			opacity: 0;
		}
		to {
			transform: translate(-50%, 0);
			opacity: 1;
		}
	}
</style>
