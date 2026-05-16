<script lang="ts">
	import type { CaseData, FDI } from '$lib/types';
	import type { ArchAnalysis } from '$lib/domain';
	import { archPositions, SVG_VIEWBOX } from '$lib/domain/geometry';

	interface Props {
		caseData: CaseData;
		analysis: ArchAnalysis;
	}
	let { caseData, analysis }: Props = $props();

	const positions = $derived(archPositions(analysis.arch));
	const abutmentSet = $derived(new Set(analysis.abutments));

	function toneOf(fdi: FDI): 'normal' | 'missing' | 'abutment' | 'concern' {
		const s = caseData.teeth[fdi];
		if (s.status === 'missing') return 'missing';
		if (s.prognosis === 'poor' || s.crownRoot === 'unfavorable') return 'concern';
		if (abutmentSet.has(fdi)) return 'abutment';
		return 'normal';
	}

	const fulcrumPoints = $derived.by(() => {
		const restAbutments = analysis.spans.flatMap((s) => {
			const list: FDI[] = [];
			if (s.rightAbutment) list.push(s.rightAbutment);
			if (s.leftAbutment) list.push(s.leftAbutment);
			return list;
		});
		const unique = [...new Set(restAbutments)];
		return unique
			.map((fdi) => positions.find((p) => p.fdi === fdi))
			.filter((p): p is NonNullable<typeof p> => p !== undefined);
	});

	const archLabel = $derived(analysis.arch === 'maxilla' ? 'ขากรรไกรบน' : 'ขากรรไกรล่าง');
	const titleId = $derived(`arch-title-${analysis.arch}`);
	const descId = $derived(`arch-desc-${analysis.arch}`);
</script>

<svg
	viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
	role="img"
	aria-labelledby={titleId}
	aria-describedby={descId}
	class="arch-svg"
>
	<title id={titleId}>{archLabel} — {analysis.classification.label}</title>
	<desc id={descId}>
		แผนภาพ {archLabel} แสดงตำแหน่งฟัน {positions.filter((p) => caseData.teeth[p.fdi].status === 'present').length}
		ซี่ที่เหลือ และ {analysis.spans.length} edentulous span. Abutments: {analysis.abutments.join(', ') || 'none'}.
	</desc>

	{#if fulcrumPoints.length >= 2}
		{#each fulcrumPoints as p, i (p.fdi + '-fp')}
			{#if i > 0}
				{@const prev = fulcrumPoints[i - 1]}
				<line
					x1={prev.x}
					y1={prev.y}
					x2={p.x}
					y2={p.y}
					stroke="var(--color-gold-400)"
					stroke-width="1.5"
					stroke-dasharray="4 3"
					opacity="0.7"
				/>
			{/if}
		{/each}
	{/if}

	{#each positions as p (p.fdi)}
		{@const tone = toneOf(p.fdi)}
		<g class="tooth tone-{tone}">
			<circle
				cx={p.x}
				cy={p.y}
				r="11"
				fill={tone === 'missing'
					? 'transparent'
					: tone === 'abutment'
						? 'var(--color-teal-100)'
						: tone === 'concern'
							? 'var(--color-coral-100)'
							: 'white'}
				stroke={tone === 'abutment'
					? 'var(--color-teal-600)'
					: tone === 'concern'
						? 'var(--color-coral-600)'
						: tone === 'missing'
							? 'var(--color-ink-muted)'
							: 'var(--color-line)'}
				stroke-width={tone === 'abutment' ? '2' : '1.5'}
				stroke-dasharray={tone === 'missing' ? '3 2' : undefined}
			>
				<title>ฟัน {p.fdi} — {tone === 'missing' ? 'หายไป' : tone === 'abutment' ? 'Abutment' : tone === 'concern' ? 'ต้องระวัง' : 'มีอยู่'}</title>
			</circle>
			<text
				x={p.x}
				y={p.y + 3}
				text-anchor="middle"
				font-size="8"
				font-weight="600"
				fill={tone === 'missing' ? 'var(--color-ink-muted)' : 'var(--color-ink)'}
				font-family="inherit"
			>
				{p.fdi}
			</text>
			{#if abutmentSet.has(p.fdi) && caseData.teeth[p.fdi].status === 'present'}
				<polygon
					points={`${p.x - 4},${analysis.arch === 'maxilla' ? p.y + 15 : p.y - 15} ${p.x + 4},${analysis.arch === 'maxilla' ? p.y + 15 : p.y - 15} ${p.x},${analysis.arch === 'maxilla' ? p.y + 19 : p.y - 19}`}
					fill="var(--color-teal-700)"
				>
					<title>Rest seat บนฟัน {p.fdi}</title>
				</polygon>
			{/if}
		</g>
	{/each}

	<text
		x={SVG_VIEWBOX.width / 2}
		y={analysis.arch === 'maxilla' ? 12 : SVG_VIEWBOX.height - 4}
		text-anchor="middle"
		font-size="10"
		fill="var(--color-ink-muted)"
		font-family="inherit"
	>
		{archLabel} · {analysis.classification.label}
	</text>
</svg>

<style>
	.arch-svg {
		width: 100%;
		height: auto;
		display: block;
	}
</style>
