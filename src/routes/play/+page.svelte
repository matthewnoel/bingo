<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		decodeOptions,
		encodeOptions,
		generateBoard,
		encodeBoard,
		decodeBoard,
		encodeChecked,
		decodeChecked,
		resolveGrid,
		resolveCheckedGrid,
		checkBingo,
		gridToPlayableIndex,
		GRID_SIZE,
		CELL_COUNT,
		FREE_SPACE_INDEX,
		PLAYABLE_CELLS
	} from '$lib/bingo';
	import Button from '$lib/components/Button.svelte';

	let options = $state<string[]>([]);
	let board = $state<number[]>([]);
	let checked = $state<boolean[]>(new Array(PLAYABLE_CELLS).fill(false));
	let initialized = $state(false);

	const grid = $derived(resolveGrid(board, options));
	const checkedGrid = $derived(resolveCheckedGrid(checked));
	const hasBingo = $derived(initialized && checkBingo(checkedGrid));

	function initialize() {
		const params = page.url.searchParams;
		const optionsParam = params.get('options');
		if (!optionsParam) {
			goto(resolve('/'), { replaceState: true });
			return;
		}

		options = decodeOptions(optionsParam);
		const boardParam = params.get('board');
		const checkedParam = params.get('checked');

		if (boardParam) {
			board = decodeBoard(boardParam);
			checked = checkedParam ? decodeChecked(checkedParam) : new Array(PLAYABLE_CELLS).fill(false);
		} else {
			board = generateBoard(options.length);
			checked = new Array(PLAYABLE_CELLS).fill(false);
			updateUrl();
		}

		initialized = true;
	}

	function updateUrl() {
		const optionsStr = encodeURIComponent(encodeOptions(options));
		const boardStr = encodeBoard(board);
		const checkedStr = encodeChecked(checked);
		goto(resolve(`/play?options=${optionsStr}&board=${boardStr}&checked=${checkedStr}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function toggleCell(gridIdx: number) {
		if (gridIdx === FREE_SPACE_INDEX) return;
		const playableIdx = gridToPlayableIndex(gridIdx);
		if (playableIdx < 0) return;
		checked[playableIdx] = !checked[playableIdx];
		updateUrl();
	}

	let sharecopied = $state(false);
	async function shareCard() {
		await navigator.clipboard.writeText(window.location.href);
		sharecopied = true;
		setTimeout(() => (sharecopied = false), 2000);
	}

	$effect(() => {
		untrack(() => initialize());
	});
</script>

<svelte:head>
	<title>Bingo!</title>
</svelte:head>

{#if initialized}
	<div class="mx-auto max-w-lg px-4 py-6">
		{#if hasBingo}
			<div class="mb-4 rounded-xl border-2 border-action bg-action/10 p-4 text-center">
				<span class="text-3xl font-black tracking-widest text-action-dark">BINGO!</span>
			</div>
		{/if}

		<div
			class="grid aspect-square gap-1.5 rounded-xl bg-brand p-1.5"
			style="grid-template-columns: repeat({GRID_SIZE}, 1fr);"
		>
			{#each Array(CELL_COUNT) as _cell, i (i)}
				{@const isFree = i === FREE_SPACE_INDEX}
				{@const isChecked = checkedGrid[i]}
				<button
					onclick={() => toggleCell(i)}
					disabled={isFree}
					class="relative flex items-center justify-center overflow-hidden rounded-lg p-1 text-center text-xs font-medium transition-all select-none
						{isFree
						? 'cursor-default bg-action/20 font-bold text-action-dark'
						: isChecked
							? 'bg-action text-white shadow-inner'
							: 'cursor-pointer bg-white hover:bg-brand-lighter'}"
					aria-label={isFree
						? 'Free space'
						: `${grid[i] || 'Blank'} - ${isChecked ? 'checked' : 'unchecked'}`}
				>
					<span class="line-clamp-4 leading-tight break-words">{grid[i]}</span>
					{#if isChecked && !isFree}
						<span class="absolute inset-0 flex items-center justify-center">
							<svg
								class="h-3/4 w-3/4 opacity-20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</span>
					{/if}
				</button>
			{/each}
		</div>

		<div class="mt-4 flex gap-3">
			<Button
				onclick={shareCard}
				label={sharecopied ? 'Link Copied!' : 'Share Card'}
				variant="secondary"
			/>
			<a
				href={resolve('/')}
				class="flex-1 rounded-lg bg-action px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-action-dark"
			>
				New Game
			</a>
		</div>
	</div>
{:else}
	<div class="flex h-64 items-center justify-center">
		<span class="text-neutral-400">Loading...</span>
	</div>
{/if}
