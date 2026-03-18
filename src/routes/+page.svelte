<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { encodeOptions, decodeOptions, PLAYABLE_CELLS } from '$lib/bingo';
	import Button from '$lib/components/Button.svelte';

	let options = $state<string[]>(['']);
	let generatedLink = $state('');
	let copied = $state(false);
	let configCopied = $state(false);

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

	function getConfigUrl(): string {
		const filtered = options.map((o) => o.trim()).filter(Boolean);
		if (filtered.length === 0) return '';
		const encoded = encodeURIComponent(encodeOptions(filtered));
		return `${window.location.origin}${resolve(`/?options=${encoded}`)}`;
	}

	async function copyConfig() {
		const url = getConfigUrl();
		if (!url) return;
		await navigator.clipboard.writeText(url);
		configCopied = true;
		setTimeout(() => (configCopied = false), 2000);
	}

	function loadFromUrl() {
		const optionsParam = page.url.searchParams.get('options');
		if (optionsParam) {
			const decoded = decodeOptions(optionsParam);
			if (decoded.length > 0) {
				options = decoded;
			}
		}
	}

	$effect(() => {
		untrack(() => loadFromUrl());
	});

	const filledCount = $derived(options.filter((o) => o.trim()).length);
</script>

<svelte:head>
	<title>Bingo Card Creator</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-2 text-3xl font-bold text-brand">Bingo Card Creator</h1>
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
					placeholder="e.g. Says the word veneer"
					class="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
				/>
				<Button
					onclick={() => removeOption(i)}
					label="✕"
					variant="secondary"
					aria-label="Remove option {i + 1}"
					disabled={options.length === 1 && !options[0]}
				/>
			</div>
		{/each}
	</div>

	<div class="mb-6 flex items-center gap-3">
		<Button
			onclick={addOption}
			label="+ Add Option"
			variant="secondary"
			disabled={options.length >= PLAYABLE_CELLS}
		/>
		<span class="text-sm text-neutral-400">
			{filledCount}/{PLAYABLE_CELLS} squares filled
		</span>
	</div>

	<div class="flex gap-3">
		<Button onclick={generateLink} label="Generate Bingo Link" disabled={filledCount === 0} />
		<Button
			onclick={copyConfig}
			label={configCopied ? 'Copied!' : 'Share Config'}
			variant="secondary"
			disabled={filledCount === 0}
		/>
	</div>

	{#if generatedLink}
		<div class="mt-6 rounded-lg border border-brand/10 bg-brand-lighter p-4">
			<p class="mb-2 text-sm font-medium text-brand">Share this link with players:</p>
			<div class="flex gap-2">
				<input
					type="text"
					readonly
					value={generatedLink}
					class="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm select-all"
				/>
				<Button onclick={copyLink} label={copied ? 'Copied!' : 'Copy'} />
			</div>
		</div>
	{/if}
</div>
