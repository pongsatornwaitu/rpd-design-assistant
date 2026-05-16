<script lang="ts">
	interface Props {
		label: string;
		hint?: string;
		checked: boolean;
		onchange: (checked: boolean) => void;
	}
	let { label, hint, checked, onchange }: Props = $props();
</script>

<label class="toggle">
	<div class="toggle-text">
		<span class="toggle-label">{label}</span>
		{#if hint}<span class="toggle-hint">{hint}</span>{/if}
	</div>
	<span class="toggle-switch" class:checked role="presentation">
		<input
			type="checkbox"
			{checked}
			onchange={(e) => onchange((e.currentTarget as HTMLInputElement).checked)}
		/>
		<span class="toggle-thumb"></span>
	</span>
</label>

<style>
	.toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: 0.625rem;
		cursor: pointer;
	}
	.toggle:hover {
		border-color: var(--color-teal-600);
	}
	.toggle-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}
	.toggle-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-ink);
	}
	.toggle-hint {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}
	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 2.5rem;
		height: 1.5rem;
		flex-shrink: 0;
		background: var(--color-line);
		border-radius: 999px;
		transition: background-color 160ms ease;
	}
	.toggle-switch.checked {
		background: var(--color-teal-600);
	}
	.toggle-switch input {
		position: absolute;
		opacity: 0;
		inset: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
		margin: 0;
	}
	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 1.25rem;
		height: 1.25rem;
		background: white;
		border-radius: 999px;
		box-shadow: 0 1px 3px rgb(15 23 42 / 0.2);
		transition: transform 160ms ease;
	}
	.toggle-switch.checked .toggle-thumb {
		transform: translateX(1rem);
	}
	.toggle-switch input:focus-visible + .toggle-thumb {
		outline: 2px solid var(--color-teal-600);
		outline-offset: 2px;
	}
</style>
