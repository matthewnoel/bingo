<script lang="ts">
	import { resolve } from '$app/paths';
	import { encodeOptions, PLAYABLE_CELLS } from '$lib/bingo';

	let options = $state<string[]>(['']);
	let generatedLink = $state('');
	let copied = $state(false);

	function addOption() {
		options.push('');
	}

	function removeOption(index: number) {
		options.splice(index, 1);
		if (options.length === 0) options.push('');
	}

	function generateLink() {
		const filtered = options.map((o) => o.trim()).filter(Boolean);
		if (filtered.length === 0) return;
		const encoded = encodeOptions(filtered);
		const url = new URL(resolve('/play'), window.location.origin);
		url.searchParams.set('options', encoded);
		generatedLink = url.toString();
		copied = false;
	}

	async function copyLink() {
		if (!generatedLink) return;
		await navigator.clipboard.writeText(generatedLink);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	const filledCount = $derived(options.filter((o) => o.trim()).length);
</script>

<svelte:head>
	<title>Bingo Card Creator</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-2 text-3xl font-bold">Bingo Card Creator</h1>
	<p class="mb-6 text-neutral-500">
		Enter up to {PLAYABLE_CELLS} options for your bingo card. The center space is always free.
	</p>

	<div class="mb-4 flex flex-col gap-2">
		{#each options as _, i (i)}
			<div class="flex items-center gap-2">
				<span class="w-7 text-right text-sm text-neutral-400">{i + 1}.</span>
				<input
					type="text"
					bind:value={options[i]}
					placeholder="e.g. Makes a basket"
					class="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:focus:border-blue-400 dark:focus:ring-blue-800"
				/>
				<button
					onclick={() => removeOption(i)}
					class="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
					aria-label="Remove option {i + 1}"
					disabled={options.length === 1 && !options[0]}
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>

	<div class="mb-6 flex items-center gap-3">
		<button
			onclick={addOption}
			disabled={options.length >= PLAYABLE_CELLS}
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:hover:bg-neutral-800"
		>
			+ Add Option
		</button>
		<span class="text-sm text-neutral-400">
			{filledCount}/{PLAYABLE_CELLS} squares filled
		</span>
	</div>

	<button
		onclick={generateLink}
		disabled={filledCount === 0}
		class="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
	>
		Generate Bingo Link
	</button>

	{#if generatedLink}
		<div class="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
			<p class="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
				Share this link with players:
			</p>
			<div class="flex gap-2">
				<input
					type="text"
					readonly
					value={generatedLink}
					class="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm select-all dark:border-neutral-600 dark:bg-neutral-900"
				/>
				<button
					onclick={copyLink}
					class="shrink-0 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
				>
					{copied ? 'Copied!' : 'Copy'}
				</button>
			</div>
		</div>
	{/if}
</div>
