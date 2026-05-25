<script lang="ts">
	import { settings, type Theme, type Mode } from '$lib/stores/settings.svelte';
	import { base } from '$app/paths';

	let open = $state(false);
	let panelEl: HTMLDivElement | undefined = $state();

	function closeOnOutside(e: MouseEvent) {
		if (!open) return;
		if (panelEl && !panelEl.contains(e.target as Node)) open = false;
	}

	$effect(() => {
		if (open) document.addEventListener('click', closeOnOutside);
		return () => document.removeEventListener('click', closeOnOutside);
	});

	const themes: { value: Theme; label: string; icon: string }[] = [
		{ value: 'auto', label: 'อัตโนมัติ', icon: '⌧' },
		{ value: 'light', label: 'สว่าง', icon: '☀' },
		{ value: 'dark', label: 'มืด', icon: '☾' }
	];

	const modes: { value: Mode; label: string; hint: string }[] = [
		{ value: 'learning', label: 'การเรียน', hint: 'แสดงเหตุผล + อ้างอิง' },
		{ value: 'practice', label: 'การทำงาน', hint: 'แสดงผลแบบกระชับ' }
	];
</script>

<div class="settings" bind:this={panelEl}>
	<button
		type="button"
		class="btn btn-ghost"
		onclick={(e) => {
			e.stopPropagation();
			open = !open;
		}}
		aria-label="การตั้งค่า"
		aria-expanded={open}
	>
		⚙
	</button>

	{#if open}
		<div class="panel" role="dialog" aria-label="การตั้งค่า">
			<section>
				<h3>ธีม</h3>
				<div class="seg">
					{#each themes as t (t.value)}
						<button
							type="button"
							class="seg-btn"
							class:selected={settings.theme === t.value}
							onclick={() => settings.setTheme(t.value)}
						>
							<span aria-hidden="true">{t.icon}</span>
							{t.label}
						</button>
					{/each}
				</div>
			</section>

			<section>
				<h3>โหมด</h3>
				<div class="modes">
					{#each modes as m (m.value)}
						<button
							type="button"
							class="mode-btn"
							class:selected={settings.mode === m.value}
							onclick={() => settings.setMode(m.value)}
						>
							<span class="mode-label">{m.label}</span>
							<span class="mode-hint">{m.hint}</span>
						</button>
					{/each}
				</div>
			</section>

			<section>
				<h3>การวิเคราะห์</h3>
				<label class="checkbox">
					<input
						type="checkbox"
						checked={settings.includeThirdMolars}
						onchange={() => settings.toggleThirdMolars()}
					/>
					<span>รวมฟันกรามซี่ที่สาม (18, 28, 38, 48)</span>
				</label>
			</section>

			<footer class="menu-footer">
				<a href="{base}/learn" class="link">📚 โหมดเรียนรู้แบบขั้นตอน →</a>
				<a href="{base}/compare" class="link">🔀 เปรียบเทียบ scenarios →</a>
				<a href="{base}/lab-order" class="link">📄 Lab work order →</a>
				<a href="{base}/about" class="link">เกี่ยวกับ + อ้างอิง →</a>
			</footer>
		</div>
	{/if}
</div>

<style>
	.settings {
		position: relative;
	}
	.panel {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		width: 18rem;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 0.75rem;
		box-shadow: var(--shadow-card-raised);
		padding: 0.875rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 60;
	}
	h3 {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-ink-muted);
		margin-bottom: 0.5rem;
	}
	.seg {
		display: flex;
		background: var(--color-surface);
		padding: 0.25rem;
		border-radius: 0.5rem;
		gap: 0.25rem;
	}
	.seg-btn {
		flex: 1;
		padding: 0.375rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		cursor: pointer;
	}
	.seg-btn.selected {
		background: var(--color-surface-raised);
		color: var(--color-ink);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
	}
	.modes {
		display: flex;
		gap: 0.375rem;
	}
	.mode-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.125rem;
		padding: 0.5rem 0.625rem;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 0.5rem;
		text-align: left;
		cursor: pointer;
	}
	.mode-btn.selected {
		border-color: var(--color-teal-600);
		background: var(--color-teal-50);
	}
	.mode-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-ink);
	}
	.mode-hint {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	.checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-ink);
		cursor: pointer;
	}
	.checkbox input {
		width: 1rem;
		height: 1rem;
		accent-color: var(--color-teal-600);
	}
	.menu-footer {
		border-top: 1px solid var(--color-line);
		padding-top: 0.625rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.link {
		font-size: 0.8125rem;
		color: var(--color-teal-700);
		text-decoration: none;
	}
	.link:hover {
		text-decoration: underline;
	}
</style>
