<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import {
		listCases,
		saveCase,
		loadCase,
		deleteCase,
		type SavedCaseSummary
	} from '$lib/stores/caseDb';
	import { parseCase } from '$lib/schemas/caseSchema';
	import { onMount } from 'svelte';

	let open = $state(false);
	let cases = $state<SavedCaseSummary[]>([]);
	let busy = $state(false);
	let message = $state<{ kind: 'info' | 'error' | 'success'; text: string } | null>(null);
	let fileInput: HTMLInputElement | undefined = $state();

	async function refresh() {
		cases = await listCases();
	}

	onMount(refresh);

	async function handleSave() {
		busy = true;
		try {
			await saveCase(caseStore.current);
			await refresh();
			showMessage('success', 'บันทึกเคสลงเครื่องแล้ว');
		} catch (e) {
			showMessage('error', `บันทึกไม่สำเร็จ: ${(e as Error).message}`);
		} finally {
			busy = false;
		}
	}

	async function handleLoad(id: string) {
		busy = true;
		try {
			const data = await loadCase(id);
			if (data) {
				caseStore.load(data);
				showMessage('success', `โหลดเคส "${data.meta.title}"`);
				open = false;
			}
		} finally {
			busy = false;
		}
	}

	async function handleDelete(c: SavedCaseSummary) {
		if (!confirm(`ลบเคส "${c.title}"?`)) return;
		busy = true;
		try {
			await deleteCase(c.id);
			await refresh();
			showMessage('info', 'ลบเคสแล้ว');
		} finally {
			busy = false;
		}
	}

	function handleExport() {
		const blob = new Blob([JSON.stringify(caseStore.current, null, 2)], {
			type: 'application/json'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		const safeTitle = caseStore.current.meta.title.replace(/[^\w฀-๿-]+/g, '_');
		a.href = url;
		a.download = `${safeTitle || 'rpd-case'}.json`;
		a.click();
		URL.revokeObjectURL(url);
		showMessage('success', 'ดาวน์โหลดไฟล์ JSON แล้ว');
	}

	async function handleFileChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			showMessage('error', 'ไฟล์ใหญ่เกิน 5 MB');
			target.value = '';
			return;
		}

		try {
			const text = await file.text();
			const parsed = parseCase(JSON.parse(text));
			caseStore.load(parsed);
			showMessage('success', `นำเข้าเคส "${parsed.meta.title}"`);
		} catch (err) {
			showMessage('error', `นำเข้าไม่สำเร็จ: ${(err as Error).message}`);
		} finally {
			target.value = '';
		}
	}

	function showMessage(kind: 'info' | 'error' | 'success', text: string) {
		message = { kind, text };
		setTimeout(() => {
			if (message?.text === text) message = null;
		}, 3500);
	}
</script>

<div class="case-mgr">
	<div class="actions">
		<button type="button" class="btn btn-primary" onclick={handleSave} disabled={busy}>
			💾 บันทึก
		</button>
		<button type="button" class="btn btn-ghost" onclick={() => (open = !open)}>
			📂 เปิด ({cases.length})
		</button>
		<button type="button" class="btn btn-ghost" onclick={handleExport}>⬇ Export</button>
		<button type="button" class="btn btn-ghost" onclick={() => fileInput?.click()}>
			⬆ Import
		</button>
		<input
			bind:this={fileInput}
			type="file"
			accept="application/json,.json"
			onchange={handleFileChange}
			hidden
		/>
	</div>

	{#if message}
		<div class="toast toast-{message.kind}" role="status" aria-live="polite">
			{message.text}
		</div>
	{/if}

	{#if open}
		<div class="case-list" role="region" aria-label="เคสที่บันทึกไว้">
			{#if cases.length === 0}
				<p class="empty">ยังไม่มีเคสที่บันทึกไว้ — กด "บันทึก" เพื่อเก็บเคสปัจจุบัน</p>
			{:else}
				<ul>
					{#each cases as c (c.id)}
						<li class="case-row">
							<button type="button" class="case-info" onclick={() => handleLoad(c.id)}>
								<span class="case-title">{c.title || 'ไม่มีชื่อ'}</span>
								{#if c.patient}<span class="case-patient">ผู้ป่วย: {c.patient}</span>{/if}
								<span class="case-date">{new Date(c.updatedAt).toLocaleString('th-TH')}</span>
							</button>
							<button
								type="button"
								class="case-del"
								aria-label={`ลบเคส ${c.title}`}
								onclick={() => handleDelete(c)}
							>
								🗑
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>

<style>
	.case-mgr {
		position: relative;
	}
	.actions {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}
	.toast {
		position: fixed;
		top: 5rem;
		right: 1rem;
		padding: 0.625rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		background: var(--color-teal-700);
		color: white;
		box-shadow: 0 8px 24px rgb(15 23 42 / 0.2);
		z-index: 100;
		animation: slideIn 200ms ease;
	}
	.toast-error {
		background: var(--color-coral-600);
	}
	.toast-success {
		background: var(--color-teal-700);
	}
	.toast-info {
		background: var(--color-ink);
	}
	@keyframes slideIn {
		from {
			transform: translateY(-10px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.case-list {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		min-width: 18rem;
		max-width: 24rem;
		max-height: 24rem;
		overflow-y: auto;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-line);
		border-radius: 0.75rem;
		box-shadow: var(--shadow-card-raised);
		z-index: 60;
	}
	.empty {
		padding: 1.25rem;
		text-align: center;
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
	}
	.case-list ul {
		list-style: none;
		padding: 0.25rem;
		margin: 0;
	}
	.case-row {
		display: flex;
		align-items: stretch;
		gap: 0.25rem;
		border-radius: 0.5rem;
	}
	.case-row:hover {
		background: var(--color-teal-50);
	}
	.case-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: start;
		padding: 0.625rem 0.75rem;
		background: transparent;
		border: none;
		cursor: pointer;
		gap: 0.125rem;
	}
	.case-title {
		font-weight: 600;
		color: var(--color-ink);
		font-size: 0.875rem;
	}
	.case-patient,
	.case-date {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	.case-del {
		padding: 0 0.625rem;
		background: transparent;
		border: none;
		color: var(--color-ink-muted);
		cursor: pointer;
		border-radius: 0.5rem;
	}
	.case-del:hover {
		background: var(--color-coral-100);
		color: var(--color-coral-700);
	}
</style>
