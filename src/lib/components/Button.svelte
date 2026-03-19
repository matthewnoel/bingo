<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		onclick: () => void;
		label: string;
		variant?: 'primary' | 'secondary';
		disabled?: boolean;
	} & Omit<HTMLButtonAttributes, 'onclick' | 'disabled' | 'class'>;

	let { onclick, label, variant = 'primary', disabled = false }: Props = $props();

	const variantClasses: Record<string, string> = {
		primary: 'bg-secondary px-6 py-3 font-semibold text-white hover:brightness-90',
		secondary: 'border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50'
	};
</script>

<button
	type="button"
	{onclick}
	{disabled}
	class="rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 {variantClasses[
		variant
	]}"
>
	{label}
</button>
