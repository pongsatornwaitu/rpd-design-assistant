<script lang="ts">
	import { caseStore, caseEvents } from '$lib/stores/caseStore.svelte';
	import { labels } from '$lib/i18n/labels';
	import type {
		FDI,
		UndercutLocation,
		GuidePlane,
		Prognosis,
		CrownRoot,
		SpacingType,
		Mobility,
		ToothSurvey
	} from '$lib/types';
	import SegmentedControl from './SegmentedControl.svelte';
	import ToggleSwitch from './ToggleSwitch.svelte';
	import NumericInput from './NumericInput.svelte';
	import { onMount } from 'svelte';

	interface Props {
		fdi: FDI;
	}
	let { fdi }: Props = $props();

	// Local mirror state — guarantees IMMEDIATE UI feedback regardless of
	// Svelte's deep-proxy reactivity quirks. We update local state DIRECTLY
	// on each click (instant UI), then forward to the store. A DOM event
	// listener handles external changes (undo/redo, load, other components).
	let status = $state<'present' | 'missing'>('present');
	let undercutLocation = $state<UndercutLocation>('none');
	let undercutDepthMm = $state(0);
	let guidePlane = $state<GuidePlane>('adequate');
	let vestibuleMm = $state(10);
	let prognosis = $state<Prognosis>('good');
	let crownRoot = $state<CrownRoot>('favorable');
	let mobility = $state<Mobility>('none');
	let tipped = $state(false);
	let requiresAlteration = $state(false);
	let supraerupted = $state(false);
	let surveyedCrown = $state(false);
	let spacingMesial = $state<SpacingType>('none');
	let spacingDistal = $state<SpacingType>('none');
	let notes = $state('');

	function syncFromStore() {
		const s = caseStore.snapshot().teeth[fdi];
		status = s.status;
		undercutLocation = s.undercutLocation;
		undercutDepthMm = s.undercutDepthMm;
		guidePlane = s.guidePlane;
		vestibuleMm = s.vestibuleMm;
		prognosis = s.prognosis;
		crownRoot = s.crownRoot;
		mobility = s.mobility;
		tipped = s.tipped;
		requiresAlteration = s.requiresAlteration;
		supraerupted = s.supraerupted;
		surveyedCrown = s.surveyedCrown;
		spacingMesial = s.spacingMesial;
		spacingDistal = s.spacingDistal;
		notes = s.notes;
	}

	// Re-sync when the selected tooth changes
	$effect(() => {
		void fdi;
		syncFromStore();
	});

	// External changes (undo/redo, load) → re-sync via DOM event
	onMount(() => {
		caseEvents.addEventListener('change', syncFromStore);
		return () => caseEvents.removeEventListener('change', syncFromStore);
	});

	const isPresent = $derived(status === 'present');

	// Update helper: write to BOTH local state (instant UI) and store
	// (persistence + analysis recompute). Even if event sync lags, the UI
	// reflects the click immediately because local $state was set first.
	function update<K extends keyof ToothSurvey>(key: K, value: ToothSurvey[K]) {
		// 1. Set local state immediately for instant UI feedback
		switch (key) {
			case 'status': status = value as 'present' | 'missing'; break;
			case 'undercutLocation': undercutLocation = value as UndercutLocation; break;
			case 'undercutDepthMm': undercutDepthMm = value as number; break;
			case 'guidePlane': guidePlane = value as GuidePlane; break;
			case 'vestibuleMm': vestibuleMm = value as number; break;
			case 'prognosis': prognosis = value as Prognosis; break;
			case 'crownRoot': crownRoot = value as CrownRoot; break;
			case 'mobility': mobility = value as Mobility; break;
			case 'tipped': tipped = value as boolean; break;
			case 'requiresAlteration': requiresAlteration = value as boolean; break;
			case 'supraerupted': supraerupted = value as boolean; break;
			case 'surveyedCrown': surveyedCrown = value as boolean; break;
			case 'spacingMesial': spacingMesial = value as SpacingType; break;
			case 'spacingDistal': spacingDistal = value as SpacingType; break;
			case 'notes': notes = value as string; break;
		}
		// 2. Persist to store (which triggers analysis recompute)
		caseStore.updateSurvey(fdi, { [key]: value } as Partial<ToothSurvey>);
	}

	const undercutLocationOptions = [
		{ value: 'none' as const, label: labels.undercutLocation.none },
		{ value: 'mesial' as const, label: labels.undercutLocation.mesial },
		{ value: 'distal' as const, label: labels.undercutLocation.distal },
		{ value: 'buccal' as const, label: labels.undercutLocation.buccal },
		{ value: 'lingual' as const, label: labels.undercutLocation.lingual }
	];

	const undercutPresets = [
		{ value: 0, label: '0', hint: 'ไม่มี' },
		{ value: 0.25, label: '0.25', hint: '0.01″' },
		{ value: 0.5, label: '0.5', hint: '0.02″' },
		{ value: 0.75, label: '0.75', hint: '0.03″' }
	];

	const vestibulePresets = [
		{ value: 5, label: '5', hint: 'ตื้น' },
		{ value: 7, label: '7', hint: '< lingual bar' },
		{ value: 8, label: '8', hint: 'lingual bar min' },
		{ value: 10, label: '10', hint: 'ปกติ' },
		{ value: 12, label: '12', hint: 'ลึก' }
	];

	const guidePlaneOptions = [
		{ value: 'absent' as const, label: labels.guidePlane.absent, tone: 'danger' as const },
		{ value: 'partial' as const, label: labels.guidePlane.partial, tone: 'warn' as const },
		{ value: 'adequate' as const, label: labels.guidePlane.adequate, tone: 'good' as const }
	];

	const prognosisOptions = [
		{ value: 'good' as const, label: labels.prognosis.good, tone: 'good' as const },
		{ value: 'questionable' as const, label: labels.prognosis.questionable, tone: 'warn' as const },
		{ value: 'poor' as const, label: labels.prognosis.poor, tone: 'danger' as const }
	];

	const crownRootOptions = [
		{ value: 'favorable' as const, label: labels.crownRoot.favorable, tone: 'good' as const },
		{ value: 'borderline' as const, label: labels.crownRoot.borderline, tone: 'warn' as const },
		{ value: 'unfavorable' as const, label: labels.crownRoot.unfavorable, tone: 'danger' as const }
	];

	const spacingOptions = [
		{ value: 'none' as const, label: labels.spacing.none },
		{ value: 'diastema' as const, label: labels.spacing.diastema, tone: 'warn' as const },
		{ value: 'drift' as const, label: labels.spacing.drift, tone: 'warn' as const },
		{ value: 'foodTrap' as const, label: labels.spacing.foodTrap, tone: 'warn' as const },
		{ value: 'esthetic' as const, label: labels.spacing.esthetic, tone: 'warn' as const }
	];

	const mobilityOptions = [
		{ value: 'none' as const, label: 'ไม่มี', tone: 'good' as const },
		{ value: 'grade1' as const, label: 'Grade 1', tone: 'warn' as const },
		{ value: 'grade2' as const, label: 'Grade 2', tone: 'warn' as const },
		{ value: 'grade3' as const, label: 'Grade 3', tone: 'danger' as const }
	];
</script>

<article class="card editor" aria-labelledby="se-title">
	<header class="editor-header">
		<div>
			<p class="editor-eyebrow">รายละเอียดฟัน</p>
			<h2 id="se-title">ฟัน {fdi}</h2>
		</div>
		<button
			type="button"
			class="btn"
			class:btn-danger={isPresent}
			class:btn-ghost={!isPresent}
			onclick={() => caseStore.toggleStatus(fdi)}
		>
			{isPresent ? 'ทำเครื่องหมาย: หายไป' : 'ทำเครื่องหมาย: มีอยู่'}
		</button>
	</header>

	{#if isPresent}
		<div class="editor-body">
			<section class="group" aria-labelledby="sec-undercut">
				<h3 id="sec-undercut" class="group-title">Survey — Undercut</h3>
				<div class="group-body">
					<SegmentedControl
						label={labels.field.undercutLocation}
						value={undercutLocation}
						options={undercutLocationOptions}
						onchange={(v: UndercutLocation) => update('undercutLocation', v)}
					/>
					<NumericInput
						label={labels.field.undercutDepthMm}
						value={undercutDepthMm}
						min={0}
						max={2}
						step={0.05}
						unit="mm"
						hint="วัดจาก undercut gauge"
						presets={undercutPresets}
						onchange={(v) => update('undercutDepthMm', v)}
					/>
				</div>
			</section>

			<section class="group" aria-labelledby="sec-guide">
				<h3 id="sec-guide" class="group-title">Guide Plane &amp; Vestibule</h3>
				<div class="group-body">
					<SegmentedControl
						label={labels.field.guidePlane}
						value={guidePlane}
						options={guidePlaneOptions}
						onchange={(v: GuidePlane) => update('guidePlane', v)}
					/>
					<NumericInput
						label={labels.field.vestibuleMm}
						value={vestibuleMm}
						min={0}
						max={20}
						step={0.5}
						unit="mm"
						hint="วัดจาก gingival margin → vestibule"
						presets={vestibulePresets}
						onchange={(v) => update('vestibuleMm', v)}
					/>
				</div>
			</section>

			<section class="group" aria-labelledby="sec-prog">
				<h3 id="sec-prog" class="group-title">Abutment Assessment</h3>
				<div class="group-body">
					<SegmentedControl
						label={labels.field.prognosis}
						value={prognosis}
						options={prognosisOptions}
						onchange={(v: Prognosis) => update('prognosis', v)}
					/>
					<SegmentedControl
						label={labels.field.crownRoot}
						value={crownRoot}
						options={crownRootOptions}
						onchange={(v: CrownRoot) => update('crownRoot', v)}
					/>
				</div>
			</section>

			<section class="group" aria-labelledby="sec-flags">
				<h3 id="sec-flags" class="group-title">เงื่อนไขเพิ่มเติม</h3>
				<div class="group-body toggles">
					<ToggleSwitch
						label={labels.field.tipped}
						hint="ฟันเอียงผิดแนว"
						checked={tipped}
						onchange={(v) => update('tipped', v)}
					/>
					<ToggleSwitch
						label={labels.field.requiresAlteration}
						hint="ต้องการตัดแต่งฟันก่อนใส่"
						checked={requiresAlteration}
						onchange={(v) => update('requiresAlteration', v)}
					/>
					<ToggleSwitch
						label="Antagonist supraerupted"
						hint="ฟันคู่สบขึ้นมา restorative space ลด"
						checked={supraerupted}
						onchange={(v) => update('supraerupted', v)}
					/>
					<ToggleSwitch
						label="Surveyed crown ก่อนใช้"
						hint="ฟันควรทำ crown ก่อนเป็น abutment"
						checked={surveyedCrown}
						onchange={(v) => update('surveyedCrown', v)}
					/>
				</div>

				<div class="group-body" style="margin-top: 0.875rem">
					<SegmentedControl
						label="Mobility (Miller)"
						value={mobility}
						options={mobilityOptions}
						onchange={(v) => update('mobility', v as Mobility)}
					/>
				</div>
			</section>

			<section class="group" aria-labelledby="sec-spacing">
				<h3 id="sec-spacing" class="group-title">Interdental Spacing</h3>
				<div class="group-body">
					<SegmentedControl
						label={labels.field.spacingMesial}
						value={spacingMesial}
						options={spacingOptions}
						onchange={(v: SpacingType) => update('spacingMesial', v)}
					/>
					<SegmentedControl
						label={labels.field.spacingDistal}
						value={spacingDistal}
						options={spacingOptions}
						onchange={(v: SpacingType) => update('spacingDistal', v)}
					/>
				</div>
			</section>

			<section class="group" aria-labelledby="sec-notes">
				<h3 id="sec-notes" class="group-title">{labels.field.notes}</h3>
				<textarea
					class="notes"
					rows="3"
					placeholder="หมายเหตุเฉพาะฟัน เช่น caries, restoration, mobility"
					value={notes}
					oninput={(e) => update('notes', (e.currentTarget as HTMLTextAreaElement).value)}
				></textarea>
			</section>
		</div>
	{:else}
		<div class="missing-state">
			<p class="missing-icon" aria-hidden="true">⌀</p>
			<p class="missing-title">ฟันนี้หายไป</p>
			<p class="missing-body">ฟันที่หายไปจะถูกพิจารณาสำหรับการออกแบบฐานฟันปลอม</p>
		</div>
	{/if}
</article>

<style>
	.editor {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.editor-eyebrow {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	#se-title {
		font-size: 1.375rem;
		font-weight: 700;
		color: var(--color-teal-800);
		line-height: 1.1;
	}
	.editor-body {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.group-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink);
		margin-bottom: 0.625rem;
		padding-bottom: 0.375rem;
		border-bottom: 1px dashed var(--color-line);
	}
	.group-body {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}
	.group-body.toggles {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}
	@media (min-width: 480px) {
		.group-body.toggles {
			grid-template-columns: 1fr 1fr;
		}
	}
	.notes {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--color-line);
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.875rem;
		resize: vertical;
		background: var(--color-surface-raised);
		color: var(--color-ink);
	}
	.notes:focus {
		border-color: var(--color-teal-600);
		outline: none;
	}
	.missing-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.25rem;
		padding: 2rem 1rem;
		background: repeating-linear-gradient(
			45deg,
			var(--color-line) 0 4px,
			transparent 4px 8px
		);
		border-radius: 0.75rem;
	}
	.missing-icon {
		font-size: 2.5rem;
		color: var(--color-ink-muted);
		line-height: 1;
	}
	.missing-title {
		font-weight: 600;
		color: var(--color-ink);
	}
	.missing-body {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		max-width: 24rem;
	}
</style>
