<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import { base } from '$app/paths';
	import CaseManager from './CaseManager.svelte';
	import SettingsMenu from './SettingsMenu.svelte';

	const savedLabel = $derived.by(() => {
		const t = caseStore.lastSavedAt;
		if (!t) return 'ยังไม่ได้บันทึก';
		const diff = Date.now() - t;
		if (diff < 5_000) return 'บันทึกแล้ว';
		const sec = Math.floor(diff / 1000);
		return `บันทึกล่าสุด ${sec} วินาทีที่แล้ว`;
	});
</script>

<header class="topbar">
	<a href="{base}/" class="brand" aria-label="กลับหน้าหลัก">
		<span class="logo" aria-hidden="true">RPD</span>
		<div>
			<span class="title">RPD Design Assistant</span>
			<span class="subtitle">ผู้ช่วยออกแบบฟันปลอมถอดได้บางส่วน</span>
		</div>
	</a>

	<div class="actions">
		<span class="status" aria-live="polite">{savedLabel}</span>
		<div class="undo-group">
			<button
				type="button"
				class="btn btn-ghost"
				onclick={() => caseStore.undo()}
				disabled={!caseStore.canUndo}
				aria-label="ย้อนกลับ"
				title="ย้อนกลับ (Ctrl+Z)"
			>
				↶
			</button>
			<button
				type="button"
				class="btn btn-ghost"
				onclick={() => caseStore.redo()}
				disabled={!caseStore.canRedo}
				aria-label="ทำซ้ำ"
				title="ทำซ้ำ (Ctrl+Y)"
			>
				↷
			</button>
			<button
				type="button"
				class="btn btn-ghost"
				onclick={() => {
					if (confirm('ล้างเคสปัจจุบันและเริ่มใหม่?')) caseStore.reset();
				}}
			>
				+ เคสใหม่
			</button>
		</div>
		<CaseManager />
		<SettingsMenu />
	</div>
</header>

<style>
	.topbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: var(--color-glass);
		backdrop-filter: saturate(150%) blur(10px);
		border-bottom: 1px solid var(--color-line);
		position: sticky;
		top: 0;
		z-index: 50;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: inherit;
	}
	.title,
	.subtitle {
		display: block;
	}
	.logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, var(--color-teal-600), var(--color-teal-800));
		color: white;
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
	}
	.title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-ink);
		line-height: 1.2;
	}
	.subtitle {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		line-height: 1.2;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.undo-group {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}
	.status {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		padding-inline-end: 0.5rem;
		border-inline-end: 1px solid var(--color-line);
	}
	button[disabled] {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
