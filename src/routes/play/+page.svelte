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
		const label = grid[playableIdx < FREE_SPACE_INDEX ? playableIdx : playableIdx + 1];
		if (!label) return;
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
			class="grid gap-1.5 rounded-xl bg-brand p-2"
			style="grid-template-columns: repeat({GRID_SIZE}, 1fr);"
		>
			{#each Array(CELL_COUNT) as _cell, i (i)}
				{@const isFree = i === FREE_SPACE_INDEX}
				{@const isBlank = !isFree && grid[i] === ''}
				{@const isInert = isFree || isBlank}
				{@const isChecked = checkedGrid[i]}
				{@const cellClass = isInert
					? 'cursor-default bg-brand-lighter text-brand font-bold'
					: isChecked
						? 'cursor-pointer bg-action font-semibold text-white shadow-inner'
						: 'cursor-pointer bg-white text-brand border border-brand/10 hover:bg-brand-lighter/60'}
				<button
					onclick={() => toggleCell(i)}
					disabled={isInert}
					class="relative flex min-h-12 items-center justify-center overflow-hidden rounded-lg p-1.5 text-center font-medium transition-all select-none sm:min-h-16 {cellClass}"
					style="font-size: clamp(0.55rem, 1.8vw, 0.875rem);"
					aria-label={isInert
						? 'Free space'
						: `${grid[i]} - ${isChecked ? 'checked' : 'unchecked'}`}
				>
					<span class="leading-snug text-balance break-all">
						{#if isFree}
							FREE
						{:else if !isBlank}
							{grid[i]}
						{/if}
					</span>
					{#if isChecked && !isInert}
						<span
							class="absolute right-0.5 bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/30 sm:h-5 sm:w-5"
						>
							<svg
								class="h-3 w-3 text-white sm:h-3.5 sm:w-3.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3.5"
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
