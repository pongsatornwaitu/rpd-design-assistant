<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import { onMount } from 'svelte';
	import UpdatePrompt from '$lib/components/UpdatePrompt.svelte';

	let { children } = $props();

	onMount(() => {
		function onKey(e: KeyboardEvent) {
			const isMod = e.ctrlKey || e.metaKey;
			if (!isMod) return;
			if (e.key === 'z' && !e.shiftKey) {
				e.preventDefault();
				caseStore.undo();
			} else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
				e.preventDefault();
				caseStore.redo();
			}
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>RPD Design Assistant</title>
</svelte:head>

<a href="#main" class="visually-hidden">ข้ามไปยังเนื้อหา</a>
{@render children()}
<UpdatePrompt />
