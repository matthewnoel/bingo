<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
	<header class="border-b border-neutral-200 dark:border-neutral-700">
		<div class="mx-auto flex max-w-2xl items-center px-4 py-3">
			<a href={resolve('/')} class="text-lg font-bold tracking-tight">Bingo</a>
		</div>
	</header>
	<main class="flex-1">
		{@render children()}
	</main>
</div>
