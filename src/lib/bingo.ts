export const GRID_SIZE = 5;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const PLAYABLE_CELLS = CELL_COUNT - 1;
export const FREE_SPACE_INDEX = 12;
const OPTIONS_DELIMITER = '|';

export function encodeOptions(options: string[]): string {
	return options.join(OPTIONS_DELIMITER);
}

export function decodeOptions(param: string): string[] {
	if (!param) return [];
	return param.split(OPTIONS_DELIMITER);
}

/** Produce a shuffled array of indices [0..count-1] using Fisher-Yates. */
function shuffle(count: number): number[] {
	const arr = Array.from({ length: count }, (_, i) => i);
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/**
 * Generate a board: a permutation of 24 indices into the options array.
 * If optionCount < 24, remaining slots get index -1 (blank).
 * If optionCount > 24, only the first 24 shuffled indices are used.
 */
export function generateBoard(optionCount: number): number[] {
	const available = Math.min(optionCount, PLAYABLE_CELLS);
	const indices = shuffle(optionCount).slice(0, available);
	while (indices.length < PLAYABLE_CELLS) {
		indices.push(-1);
	}
	const placed = shuffle(PLAYABLE_CELLS);
	const board: number[] = new Array(PLAYABLE_CELLS);
	for (let i = 0; i < PLAYABLE_CELLS; i++) {
		board[placed[i]] = indices[i];
	}
	return board;
}

export function encodeBoard(board: number[]): string {
	return board.join(',');
}

export function decodeBoard(param: string): number[] {
	if (!param) return [];
	return param.split(',').map(Number);
}

export function encodeChecked(checked: boolean[]): string {
	return checked.map((v) => (v ? '1' : '0')).join('');
}

export function decodeChecked(param: string): boolean[] {
	if (!param) return new Array(PLAYABLE_CELLS).fill(false);
	return param.split('').map((c) => c === '1');
}

/**
 * Resolve the 5x5 grid cell labels from board indices and options.
 * Returns a flat array of 25 strings; index 12 is always "FREE".
 */
export function resolveGrid(board: number[], options: string[]): string[] {
	const grid: string[] = [];
	let boardIdx = 0;
	for (let i = 0; i < CELL_COUNT; i++) {
		if (i === FREE_SPACE_INDEX) {
			grid.push('FREE');
		} else {
			const optionIdx = board[boardIdx];
			grid.push(optionIdx >= 0 && optionIdx < options.length ? options[optionIdx] : '');
			boardIdx++;
		}
	}
	return grid;
}

/**
 * Resolve the full 25-cell checked state from the 24-cell checked array.
 * The free space (index 12) is always true.
 */
export function resolveCheckedGrid(checked: boolean[]): boolean[] {
	const full: boolean[] = [];
	let checkIdx = 0;
	for (let i = 0; i < CELL_COUNT; i++) {
		if (i === FREE_SPACE_INDEX) {
			full.push(true);
		} else {
			full.push(checked[checkIdx] ?? false);
			checkIdx++;
		}
	}
	return full;
}

/** Check if any row, column, or diagonal is fully checked. */
export function checkBingo(checkedGrid: boolean[]): boolean {
	for (let r = 0; r < GRID_SIZE; r++) {
		if (checkedGrid.slice(r * GRID_SIZE, r * GRID_SIZE + GRID_SIZE).every(Boolean)) return true;
	}
	for (let c = 0; c < GRID_SIZE; c++) {
		let col = true;
		for (let r = 0; r < GRID_SIZE; r++) {
			if (!checkedGrid[r * GRID_SIZE + c]) {
				col = false;
				break;
			}
		}
		if (col) return true;
	}
	if (Array.from({ length: GRID_SIZE }, (_, i) => checkedGrid[i * GRID_SIZE + i]).every(Boolean))
		return true;
	if (
		Array.from(
			{ length: GRID_SIZE },
			(_, i) => checkedGrid[i * GRID_SIZE + (GRID_SIZE - 1 - i)]
		).every(Boolean)
	)
		return true;
	return false;
}

/**
 * Convert a playable-cell index (0-23) to the full grid index (0-24),
 * accounting for the free space at position 12.
 */
export function playableToGridIndex(playableIdx: number): number {
	return playableIdx < FREE_SPACE_INDEX ? playableIdx : playableIdx + 1;
}

/**
 * Convert a full grid index (0-24) to a playable-cell index (0-23).
 * Returns -1 for the free space.
 */
export function gridToPlayableIndex(gridIdx: number): number {
	if (gridIdx === FREE_SPACE_INDEX) return -1;
	return gridIdx < FREE_SPACE_INDEX ? gridIdx : gridIdx - 1;
}
