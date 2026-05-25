<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let available = $state(false);
	let waiting: ServiceWorker | null = null;
	// Only auto-reload when the user EXPLICITLY clicked "รีเฟรช" — otherwise
	// a fresh SW activation on initial load would trigger reload, which would
	// register a fresh SW, fire controllerchange again → infinite loop.
	let userTriggeredUpdate = false;

	onMount(async () => {
		if (!('serviceWorker' in navigator)) return;
		try {
			const reg = await navigator.serviceWorker.register(`${base}/service-worker.js`, {
				type: 'module'
			});

			if (reg.waiting) {
				waiting = reg.waiting;
				available = true;
			}

			reg.addEventListener('updatefound', () => {
				const newSw = reg.installing;
				if (!newSw) return;
				newSw.addEventListener('statechange', () => {
					if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
						waiting = newSw;
						available = true;
					}
				});
			});

			navigator.serviceWorker.addEventListener('controllerchange', () => {
				// Guard: only reload if the user explicitly asked for an update.
				// Without this guard, any SW activation (e.g., initial install with
				// skipWaiting) would loop the page forever.
				if (!userTriggeredUpdate) return;
				window.location.reload();
			});
		} catch (e) {
			console.warn('SW registration failed', e);
		}
	});

	function applyUpdate() {
		userTriggeredUpdate = true;
		waiting?.postMessage({ type: 'SKIP_WAITING' });
	}

	function dismiss() {
		available = false;
	}
</script>

{#if available}
	<div class="update" role="status" aria-live="polite">
		<span class="update-text">มีเวอร์ชันใหม่พร้อมใช้งาน</span>
		<button type="button" class="btn btn-primary" onclick={applyUpdate}>รีเฟรช</button>
		<button type="button" class="btn btn-ghost" onclick={dismiss}>ภายหลัง</button>
	</div>
{/if}

<style>
	.update {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 1rem;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 999px;
		box-shadow: var(--shadow-card-raised);
		z-index: 200;
		max-width: calc(100vw - 2rem);
	}
	.update-text {
		font-size: 0.875rem;
		color: var(--color-ink);
	}
</style>
