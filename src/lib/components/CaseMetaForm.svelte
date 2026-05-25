<script lang="ts">
	import { caseStore } from '$lib/stores/caseStore.svelte';
	import type {
		OcclusionType,
		OralHygiene,
		SalivaryFlow,
		TmjStatus,
		SkeletalClass,
		TongueSize,
		FrenumAttachment,
		MetalAllergy
	} from '$lib/types';

	// Snapshot pattern for read-side reactivity
	const snap = $derived.by(() => {
		caseStore.revision;
		return caseStore.snapshot();
	});

	let showAdvanced = $state(false);

	const occlusionOptions: { value: OcclusionType; label: string }[] = [
		{ value: 'normal', label: 'ปกติ' },
		{ value: 'deepBite', label: 'Deep bite' },
		{ value: 'openBite', label: 'Open bite' },
		{ value: 'crossBite', label: 'Cross bite' },
		{ value: 'edge', label: 'Edge-to-edge' }
	];

	const ohOptions: { value: OralHygiene; label: string }[] = [
		{ value: 'good', label: 'ดี' },
		{ value: 'fair', label: 'ปานกลาง' },
		{ value: 'poor', label: 'แย่' }
	];

	const salivaryOptions: { value: SalivaryFlow; label: string }[] = [
		{ value: 'normal', label: 'ปกติ' },
		{ value: 'reduced', label: 'ลด' },
		{ value: 'xerostomia', label: 'Xerostomia' }
	];

	const tmjOptions: { value: TmjStatus; label: string }[] = [
		{ value: 'normal', label: 'ปกติ' },
		{ value: 'clicking', label: 'Clicking' },
		{ value: 'pain', label: 'Pain' },
		{ value: 'limited', label: 'Limited opening' }
	];

	const skeletalOptions: { value: SkeletalClass; label: string }[] = [
		{ value: 'class1', label: 'Class I' },
		{ value: 'class2', label: 'Class II' },
		{ value: 'class3', label: 'Class III' }
	];

	const tongueOptions: { value: TongueSize; label: string }[] = [
		{ value: 'small', label: 'เล็ก' },
		{ value: 'normal', label: 'ปกติ' },
		{ value: 'large', label: 'ใหญ่' }
	];

	const frenumOptions: { value: FrenumAttachment; label: string }[] = [
		{ value: 'low', label: 'Low' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'high', label: 'High' }
	];

	const allergyOptions: { value: MetalAllergy; label: string }[] = [
		{ value: 'none', label: 'ไม่มี' },
		{ value: 'nickel', label: 'Nickel' },
		{ value: 'cobalt-chromium', label: 'Co-Cr' },
		{ value: 'multiple', label: 'หลายชนิด' }
	];
</script>

<section class="card meta" aria-labelledby="meta-title">
	<header class="meta-head">
		<h2 id="meta-title">ข้อมูลเคส</h2>
		<button
			type="button"
			class="toggle-adv"
			onclick={() => (showAdvanced = !showAdvanced)}
			aria-expanded={showAdvanced}
		>
			{showAdvanced ? '▾' : '▸'} Patient factors + Interarch space
		</button>
	</header>

	<div class="meta-grid">
		<label>
			<span>ชื่อเคส</span>
			<input
				type="text"
				value={snap.meta.title}
				oninput={(e) =>
					caseStore.setMeta({ title: (e.currentTarget as HTMLInputElement).value })}
				placeholder="เคส #1"
			/>
		</label>
		<label>
			<span>ชื่อผู้ป่วย / ID</span>
			<input
				type="text"
				value={snap.meta.patient}
				oninput={(e) =>
					caseStore.setMeta({ patient: (e.currentTarget as HTMLInputElement).value })}
				placeholder="(ไม่ระบุ — ห้ามใส่ข้อมูลส่วนตัวที่ระบุตัวตน)"
			/>
		</label>
	</div>

	{#if showAdvanced}
		<details class="adv" open>
			<summary>Interarch space (mm)</summary>
			<div class="num-grid">
				<label>
					<span>Anterior</span>
					<input
						type="number"
						min="0"
						max="25"
						step="0.5"
						value={snap.interarch.anteriorMm}
						oninput={(e) =>
							caseStore.setInterarch({
								anteriorMm: parseFloat((e.currentTarget as HTMLInputElement).value) || 0
							})}
					/>
					<small>เป้า ≥ 10 mm</small>
				</label>
				<label>
					<span>Posterior ขวา</span>
					<input
						type="number"
						min="0"
						max="20"
						step="0.5"
						value={snap.interarch.posteriorRightMm}
						oninput={(e) =>
							caseStore.setInterarch({
								posteriorRightMm: parseFloat((e.currentTarget as HTMLInputElement).value) || 0
							})}
					/>
					<small>เป้า ≥ 8 mm</small>
				</label>
				<label>
					<span>Posterior ซ้าย</span>
					<input
						type="number"
						min="0"
						max="20"
						step="0.5"
						value={snap.interarch.posteriorLeftMm}
						oninput={(e) =>
							caseStore.setInterarch({
								posteriorLeftMm: parseFloat((e.currentTarget as HTMLInputElement).value) || 0
							})}
					/>
					<small>เป้า ≥ 8 mm</small>
				</label>
			</div>
		</details>

		<details class="adv">
			<summary>Patient factors</summary>
			<div class="patient-grid">
				<label class="check">
					<input
						type="checkbox"
						checked={snap.patientFactors.bruxism}
						onchange={(e) =>
							caseStore.setPatientFactors({
								bruxism: (e.currentTarget as HTMLInputElement).checked
							})}
					/>
					<span>Bruxism (นอนกัดฟัน)</span>
				</label>
				<label class="check">
					<input
						type="checkbox"
						checked={snap.patientFactors.highSmileLine}
						onchange={(e) =>
							caseStore.setPatientFactors({
								highSmileLine: (e.currentTarget as HTMLInputElement).checked
							})}
					/>
					<span>High smile line (โชว์เหงือก)</span>
				</label>
				<label class="check">
					<input
						type="checkbox"
						checked={snap.patientFactors.maxillaryTorus}
						onchange={(e) =>
							caseStore.setPatientFactors({
								maxillaryTorus: (e.currentTarget as HTMLInputElement).checked
							})}
					/>
					<span>Torus palatinus</span>
				</label>
				<label class="check">
					<input
						type="checkbox"
						checked={snap.patientFactors.mandibularTori}
						onchange={(e) =>
							caseStore.setPatientFactors({
								mandibularTori: (e.currentTarget as HTMLInputElement).checked
							})}
					/>
					<span>Tori mandibularis</span>
				</label>

				<label class="select">
					<span>Oral hygiene</span>
					<select
						value={snap.patientFactors.oralHygiene}
						onchange={(e) =>
							caseStore.setPatientFactors({
								oralHygiene: (e.currentTarget as HTMLSelectElement).value as OralHygiene
							})}
					>
						{#each ohOptions as o (o.value)}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</label>

				<label class="select">
					<span>Occlusion</span>
					<select
						value={snap.patientFactors.occlusion}
						onchange={(e) =>
							caseStore.setPatientFactors({
								occlusion: (e.currentTarget as HTMLSelectElement).value as OcclusionType
							})}
					>
						{#each occlusionOptions as o (o.value)}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</label>

				<label class="select">
					<span>Skeletal class</span>
					<select
						value={snap.patientFactors.skeletalClass}
						onchange={(e) =>
							caseStore.setPatientFactors({
								skeletalClass: (e.currentTarget as HTMLSelectElement).value as SkeletalClass
							})}
					>
						{#each skeletalOptions as o (o.value)}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</label>

				<label class="select">
					<span>Salivary flow</span>
					<select
						value={snap.patientFactors.salivaryFlow}
						onchange={(e) =>
							caseStore.setPatientFactors({
								salivaryFlow: (e.currentTarget as HTMLSelectElement).value as SalivaryFlow
							})}
					>
						{#each salivaryOptions as o (o.value)}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</label>

				<label class="select">
					<span>TMJ status</span>
					<select
						value={snap.patientFactors.tmjStatus}
						onchange={(e) =>
							caseStore.setPatientFactors({
								tmjStatus: (e.currentTarget as HTMLSelectElement).value as TmjStatus
							})}
					>
						{#each tmjOptions as o (o.value)}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</label>

				<label class="select">
					<span>Tongue size</span>
					<select
						value={snap.patientFactors.tongueSize}
						onchange={(e) =>
							caseStore.setPatientFactors({
								tongueSize: (e.currentTarget as HTMLSelectElement).value as TongueSize
							})}
					>
						{#each tongueOptions as o (o.value)}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</label>

				<label class="select">
					<span>Frenum attachment</span>
					<select
						value={snap.patientFactors.frenumAttachment}
						onchange={(e) =>
							caseStore.setPatientFactors({
								frenumAttachment: (e.currentTarget as HTMLSelectElement).value as FrenumAttachment
							})}
					>
						{#each frenumOptions as o (o.value)}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</label>

				<label class="select">
					<span>Metal allergy</span>
					<select
						value={snap.patientFactors.metalAllergy}
						onchange={(e) =>
							caseStore.setPatientFactors({
								metalAllergy: (e.currentTarget as HTMLSelectElement).value as MetalAllergy
							})}
					>
						{#each allergyOptions as o (o.value)}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</label>

				<label class="select">
					<span>อายุ (ปี)</span>
					<input
						type="number"
						min="0"
						max="120"
						value={snap.patientFactors.age}
						oninput={(e) =>
							caseStore.setPatientFactors({
								age: parseInt((e.currentTarget as HTMLInputElement).value) || 0
							})}
					/>
				</label>
			</div>
		</details>
	{/if}
</section>

<style>
	.meta {
		padding: 0.875rem 1rem;
	}
	.meta-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.625rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	h2 {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.toggle-adv {
		font-size: 0.75rem;
		background: transparent;
		border: 1px solid var(--color-line);
		border-radius: 0.375rem;
		padding: 0.25rem 0.5rem;
		color: var(--color-ink-muted);
		cursor: pointer;
	}
	.toggle-adv:hover {
		color: var(--color-ink);
		border-color: var(--color-teal-600);
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
	label > span {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	input[type='text'],
	input[type='number'],
	select {
		padding: 0.4375rem 0.625rem;
		border: 1px solid var(--color-line);
		border-radius: 0.4375rem;
		background: var(--color-surface-raised);
		font: inherit;
		font-size: 0.875rem;
		color: var(--color-ink);
	}
	input:focus,
	select:focus {
		border-color: var(--color-teal-600);
		outline: none;
	}
	small {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
	}

	.adv {
		margin-top: 0.75rem;
		border: 1px solid var(--color-line);
		border-radius: 0.5rem;
		overflow: hidden;
	}
	.adv summary {
		padding: 0.4375rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink);
		background: var(--color-surface);
		cursor: pointer;
		user-select: none;
	}
	.adv summary:hover {
		background: var(--color-teal-50);
	}
	.adv > *:not(summary) {
		padding: 0.75rem;
	}
	.num-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.625rem;
	}
	@media (max-width: 520px) {
		.num-grid {
			grid-template-columns: 1fr;
		}
	}
	.patient-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem 0.75rem;
	}
	@media (max-width: 520px) {
		.patient-grid {
			grid-template-columns: 1fr;
		}
	}
	.check {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		padding: 0.375rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 0.4375rem;
		cursor: pointer;
	}
	.check input {
		accent-color: var(--color-teal-600);
		width: 1rem;
		height: 1rem;
	}
	.select span {
		margin-bottom: 0.25rem;
	}
</style>
