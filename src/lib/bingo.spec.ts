import { describe, expect, it } from 'vitest';
import {
	encodeOptions,
	decodeOptions,
	generateBoard,
	encodeBoard,
	decodeBoard,
	encodeChecked,
	decodeChecked,
	resolveGrid,
	resolveCheckedGrid,
	checkBingo,
	gridToPlayableIndex,
	playableToGridIndex,
	PLAYABLE_CELLS,
	FREE_SPACE_INDEX,
	CELL_COUNT,
	GRID_SIZE
} from './bingo';

describe('encodeOptions / decodeOptions', () => {
	it('round-trips a list of options', () => {
		const opts = ['Makes a basket', "Says the word 'winner'", 'Timeout called'];
		expect(decodeOptions(encodeOptions(opts))).toEqual(opts);
	});

	it('handles empty input', () => {
		expect(decodeOptions('')).toEqual([]);
		expect(encodeOptions([])).toBe('');
	});

	it('preserves commas inside options', () => {
		const opts = ['Red, white, blue', 'One, two'];
		expect(decodeOptions(encodeOptions(opts))).toEqual(opts);
	});
});

describe('generateBoard', () => {
	it('returns exactly 24 entries', () => {
		expect(generateBoard(24)).toHaveLength(PLAYABLE_CELLS);
	});

	it('pads with -1 when fewer than 24 options', () => {
		const board = generateBoard(10);
		expect(board).toHaveLength(PLAYABLE_CELLS);
		const blanks = board.filter((v) => v === -1);
		expect(blanks).toHaveLength(14);
	});

	it('uses only indices 0..23 when given exactly 24 options', () => {
		const board = generateBoard(24);
		const sorted = [...board].sort((a, b) => a - b);
		expect(sorted).toEqual(Array.from({ length: 24 }, (_, i) => i));
	});

	it('truncates when given more than 24 options', () => {
		const board = generateBoard(30);
		expect(board).toHaveLength(PLAYABLE_CELLS);
		expect(board.every((v) => v >= 0 && v < 30)).toBe(true);
		expect(new Set(board).size).toBe(PLAYABLE_CELLS);
	});
});

describe('encodeBoard / decodeBoard', () => {
	it('round-trips a board', () => {
		const board = generateBoard(24);
		expect(decodeBoard(encodeBoard(board))).toEqual(board);
	});

	it('handles empty', () => {
		expect(decodeBoard('')).toEqual([]);
	});
});

describe('encodeChecked / decodeChecked', () => {
	it('round-trips checked state', () => {
		const checked = new Array(PLAYABLE_CELLS).fill(false);
		checked[0] = true;
		checked[5] = true;
		checked[23] = true;
		expect(decodeChecked(encodeChecked(checked))).toEqual(checked);
	});

	it('defaults to all false for empty param', () => {
		const result = decodeChecked('');
		expect(result).toHaveLength(PLAYABLE_CELLS);
		expect(result.every((v) => v === false)).toBe(true);
	});
});

describe('resolveGrid', () => {
	it('places FREE at index 12', () => {
		const board = Array.from({ length: 24 }, (_, i) => i);
		const options = Array.from({ length: 24 }, (_, i) => `Opt${i}`);
		const grid = resolveGrid(board, options);
		expect(grid).toHaveLength(CELL_COUNT);
		expect(grid[FREE_SPACE_INDEX]).toBe('FREE');
	});

	it('maps -1 indices to empty string', () => {
		const board = new Array(24).fill(-1);
		const grid = resolveGrid(board, ['Only']);
		expect(grid[0]).toBe('');
		expect(grid[FREE_SPACE_INDEX]).toBe('FREE');
	});
});

describe('resolveCheckedGrid', () => {
	it('inserts true at the free space index', () => {
		const checked = new Array(PLAYABLE_CELLS).fill(false);
		const full = resolveCheckedGrid(checked);
		expect(full).toHaveLength(CELL_COUNT);
		expect(full[FREE_SPACE_INDEX]).toBe(true);
		expect(full[0]).toBe(false);
	});
});

describe('checkBingo', () => {
	function makeGrid(indices: number[]): boolean[] {
		const g = new Array(CELL_COUNT).fill(false);
		for (const i of indices) g[i] = true;
		return g;
	}

	it('detects a row win', () => {
		expect(checkBingo(makeGrid([0, 1, 2, 3, 4]))).toBe(true);
	});

	it('detects a column win', () => {
		expect(checkBingo(makeGrid([0, 5, 10, 15, 20]))).toBe(true);
	});

	it('detects main diagonal win', () => {
		expect(checkBingo(makeGrid([0, 6, 12, 18, 24]))).toBe(true);
	});

	it('detects anti-diagonal win', () => {
		expect(checkBingo(makeGrid([4, 8, 12, 16, 20]))).toBe(true);
	});

	it('returns false when no line is complete', () => {
		expect(checkBingo(makeGrid([0, 1, 2, 3]))).toBe(false);
	});

	it('returns false for an empty board', () => {
		expect(checkBingo(new Array(CELL_COUNT).fill(false))).toBe(false);
	});
});

describe('index conversion', () => {
	it('playableToGridIndex skips free space', () => {
		expect(playableToGridIndex(0)).toBe(0);
		expect(playableToGridIndex(11)).toBe(11);
		expect(playableToGridIndex(12)).toBe(13);
		expect(playableToGridIndex(23)).toBe(24);
	});

	it('gridToPlayableIndex returns -1 for free space', () => {
		expect(gridToPlayableIndex(FREE_SPACE_INDEX)).toBe(-1);
		expect(gridToPlayableIndex(0)).toBe(0);
		expect(gridToPlayableIndex(11)).toBe(11);
		expect(gridToPlayableIndex(13)).toBe(12);
		expect(gridToPlayableIndex(24)).toBe(23);
	});

	it('round-trips for all playable indices', () => {
		for (let i = 0; i < PLAYABLE_CELLS; i++) {
			expect(gridToPlayableIndex(playableToGridIndex(i))).toBe(i);
		}
	});
});
