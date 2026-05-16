<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
</script>

<section class="card meta" aria-labelledby="meta-title">
	<h2 id="meta-title" class="meta-title">ข้อมูลเคส</h2>
	<div class="meta-grid">
		<label>
			<span>ชื่อเคส</span>
			<input
				type="text"
				value={caseStore.current.meta.title}
				oninput={(e) =>
					caseStore.setMeta({ title: (e.currentTarget as HTMLInputElement).value })}
				placeholder="เคส #1"
			/>
		</label>
		<label>
			<span>ชื่อผู้ป่วย / ID</span>
			<input
				type="text"
				value={caseStore.current.meta.patient}
				oninput={(e) =>
					caseStore.setMeta({ patient: (e.currentTarget as HTMLInputElement).value })}
				placeholder="(ไม่ระบุ — ห้ามใส่ข้อมูลส่วนตัวที่ระบุตัวตน)"
			/>
		</label>
	</div>
</section>

<style>
	.meta {
		padding: 0.875rem 1rem;
	}
	.meta-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 0.625rem;
	}
	.meta-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.625rem;
	}
	@media (max-width: 520px) {
		.meta-grid {
			grid-template-columns: 1fr;
		}
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	label span {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	input {
		padding: 0.4375rem 0.625rem;
		border: 1px solid var(--color-line);
		border-radius: 0.4375rem;
		background: var(--color-surface-raised);
		font: inherit;
		font-size: 0.875rem;
		color: var(--color-ink);
	}
	input:focus {
		border-color: var(--color-teal-600);
		outline: none;
	}
</style>
