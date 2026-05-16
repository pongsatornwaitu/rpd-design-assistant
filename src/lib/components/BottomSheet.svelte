<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		open: boolean;
		title?: string;
		onclose: () => void;
		children?: import('svelte').Snippet;
	}
	let { open, title, onclose, children }: Props = $props();

	let sheetEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (open && sheetEl) {
			const focusable = sheetEl.querySelector<HTMLElement>(
				'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'
			);
			focusable?.focus();
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

	onMount(() => {
		function onKey(e: KeyboardEvent) {
			if (open && e.key === 'Escape') onclose();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

{#if open}
	<div
		class="backdrop"
		role="presentation"
		onclick={onclose}
		onkeydown={(e) => e.key === 'Enter' && onclose()}
		tabindex="-1"
	></div>
	<div
		class="sheet"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		bind:this={sheetEl}
	>
		<div class="handle" aria-hidden="true"></div>
		{#if title}
			<header class="sheet-header">
				<h2>{title}</h2>
				<button type="button" class="close" onclick={onclose} aria-label="ปิด">✕</button>
			</header>
		{/if}
		<div class="sheet-body">
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgb(15 23 42 / 0.4);
		backdrop-filter: blur(2px);
		z-index: 90;
		animation: fadeIn 160ms ease;
	}
	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		max-height: 88vh;
		background: var(--color-surface-raised);
		border-top-left-radius: 1.25rem;
		border-top-right-radius: 1.25rem;
		box-shadow: 0 -8px 32px rgb(15 23 42 / 0.2);
		z-index: 100;
		display: flex;
		flex-direction: column;
		animation: slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1);
		padding-bottom: env(safe-area-inset-bottom);
	}
	.handle {
		width: 2.5rem;
		height: 0.25rem;
		background: var(--color-line);
		border-radius: 999px;
		margin: 0.625rem auto 0;
	}
	.sheet-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.625rem 1rem 0.5rem;
		border-bottom: 1px solid var(--color-line);
	}
	.sheet-header h2 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-ink);
	}
	.close {
		background: transparent;
		border: none;
		font-size: 1.125rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
	}
	.close:hover {
		background: var(--color-surface);
		color: var(--color-ink);
	}
	.sheet-body {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
