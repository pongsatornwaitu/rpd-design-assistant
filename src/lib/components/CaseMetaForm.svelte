<script lang="ts">
	import { caseStore, caseEvents } from '$lib/stores/caseStore.svelte';
	import { onMount } from 'svelte';
	import type {
		CaseData,
		OcclusionType,
		OralHygiene,
		SalivaryFlow,
		TmjStatus,
		SkeletalClass,
		TongueSize,
		FrenumAttachment,
		MetalAllergy
	} from '$lib/types';

	let showAdvanced = $state(false);

	// Local mirror state — instant UI feedback on click/typing without
	// relying on Svelte 5 cross-module proxy reactivity
	let metaTitle = $state('');
	let metaPatient = $state('');
	let anteriorMm = $state(10);
	let posteriorRightMm = $state(7);
	let posteriorLeftMm = $state(7);
	let bruxism = $state(false);
	let highSmileLine = $state(false);
	let maxillaryTorus = $state(false);
	let mandibularTori = $state(false);
	let oralHygiene = $state<OralHygiene>('good');
	let occlusion = $state<OcclusionType>('normal');
	let skeletalClass = $state<SkeletalClass>('class1');
	let salivaryFlow = $state<SalivaryFlow>('normal');
	let tmjStatus = $state<TmjStatus>('normal');
	let tongueSize = $state<TongueSize>('normal');
	let frenumAttachment = $state<FrenumAttachment>('normal');
	let metalAllergy = $state<MetalAllergy>('none');
	let age = $state(50);

	function syncFromStore() {
		const s = caseStore.snapshot();
		metaTitle = s.meta.title;
		metaPatient = s.meta.patient;
		anteriorMm = s.interarch.anteriorMm;
		posteriorRightMm = s.interarch.posteriorRightMm;
		posteriorLeftMm = s.interarch.posteriorLeftMm;
		bruxism = s.patientFactors.bruxism;
		highSmileLine = s.patientFactors.highSmileLine;
		maxillaryTorus = s.patientFactors.maxillaryTorus;
		mandibularTori = s.patientFactors.mandibularTori;
		oralHygiene = s.patientFactors.oralHygiene;
		occlusion = s.patientFactors.occlusion;
		skeletalClass = s.patientFactors.skeletalClass;
		salivaryFlow = s.patientFactors.salivaryFlow;
		tmjStatus = s.patientFactors.tmjStatus;
		tongueSize = s.patientFactors.tongueSize;
		frenumAttachment = s.patientFactors.frenumAttachment;
		metalAllergy = s.patientFactors.metalAllergy;
		age = s.patientFactors.age;
	}

	syncFromStore(); // initial

	onMount(() => {
		caseEvents.addEventListener('change', syncFromStore);
		return () => caseEvents.removeEventListener('change', syncFromStore);
	});

	function setMeta(patch: Partial<CaseData['meta']>) {
		if ('title' in patch && patch.title !== undefined) metaTitle = patch.title;
		if ('patient' in patch && patch.patient !== undefined) metaPatient = patch.patient;
		setMeta(patch);
	}

	function setInterarch(patch: Partial<CaseData['interarch']>) {
		if ('anteriorMm' in patch && patch.anteriorMm !== undefined) anteriorMm = patch.anteriorMm;
		if ('posteriorRightMm' in patch && patch.posteriorRightMm !== undefined)
			posteriorRightMm = patch.posteriorRightMm;
		if ('posteriorLeftMm' in patch && patch.posteriorLeftMm !== undefined)
			posteriorLeftMm = patch.posteriorLeftMm;
		setInterarch(patch);
	}

	function setPatient(patch: Partial<CaseData['patientFactors']>) {
		if ('bruxism' in patch && patch.bruxism !== undefined) bruxism = patch.bruxism;
		if ('highSmileLine' in patch && patch.highSmileLine !== undefined)
			highSmileLine = patch.highSmileLine;
		if ('maxillaryTorus' in patch && patch.maxillaryTorus !== undefined)
			maxillaryTorus = patch.maxillaryTorus;
		if ('mandibularTori' in patch && patch.mandibularTori !== undefined)
			mandibularTori = patch.mandibularTori;
		if (patch.oralHygiene) oralHygiene = patch.oralHygiene;
		if (patch.occlusion) occlusion = patch.occlusion;
		if (patch.skeletalClass) skeletalClass = patch.skeletalClass;
		if (patch.salivaryFlow) salivaryFlow = patch.salivaryFlow;
		if (patch.tmjStatus) tmjStatus = patch.tmjStatus;
		if (patch.tongueSize) tongueSize = patch.tongueSize;
		if (patch.frenumAttachment) frenumAttachment = patch.frenumAttachment;
		if (patch.metalAllergy) metalAllergy = patch.metalAllergy;
		if ('age' in patch && patch.age !== undefined) age = patch.age;
		setPatient(patch);
	}

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
				value={metaTitle}
				oninput={(e) =>
					setMeta({ title: (e.currentTarget as HTMLInputElement).value })}
				placeholder="เคส #1"
			/>
		</label>
		<label>
			<span>ชื่อผู้ป่วย / ID</span>
			<input
				type="text"
				value={metaPatient}
				oninput={(e) =>
					setMeta({ patient: (e.currentTarget as HTMLInputElement).value })}
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
						value={anteriorMm}
						oninput={(e) =>
							setInterarch({
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
						value={posteriorRightMm}
						oninput={(e) =>
							setInterarch({
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
						value={posteriorLeftMm}
						oninput={(e) =>
							setInterarch({
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
						checked={bruxism}
						onchange={(e) =>
							setPatient({
								bruxism: (e.currentTarget as HTMLInputElement).checked
							})}
					/>
					<span>Bruxism (นอนกัดฟัน)</span>
				</label>
				<label class="check">
					<input
						type="checkbox"
						checked={highSmileLine}
						onchange={(e) =>
							setPatient({
								highSmileLine: (e.currentTarget as HTMLInputElement).checked
							})}
					/>
					<span>High smile line (โชว์เหงือก)</span>
				</label>
				<label class="check">
					<input
						type="checkbox"
						checked={maxillaryTorus}
						onchange={(e) =>
							setPatient({
								maxillaryTorus: (e.currentTarget as HTMLInputElement).checked
							})}
					/>
					<span>Torus palatinus</span>
				</label>
				<label class="check">
					<input
						type="checkbox"
						checked={mandibularTori}
						onchange={(e) =>
							setPatient({
								mandibularTori: (e.currentTarget as HTMLInputElement).checked
							})}
					/>
					<span>Tori mandibularis</span>
				</label>

				<label class="select">
					<span>Oral hygiene</span>
					<select
						value={oralHygiene}
						onchange={(e) =>
							setPatient({
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
						value={occlusion}
						onchange={(e) =>
							setPatient({
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
						value={skeletalClass}
						onchange={(e) =>
							setPatient({
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
						value={salivaryFlow}
						onchange={(e) =>
							setPatient({
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
						value={tmjStatus}
						onchange={(e) =>
							setPatient({
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
						value={tongueSize}
						onchange={(e) =>
							setPatient({
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
						value={frenumAttachment}
						onchange={(e) =>
							setPatient({
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
						value={metalAllergy}
						onchange={(e) =>
							setPatient({
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
						value={age}
						oninput={(e) =>
							setPatient({
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
