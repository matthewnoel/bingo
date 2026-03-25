import { expect, test } from '@playwright/test';

const OPTIONS = Array.from({ length: 24 }, (_, i) => `Option number ${i + 1}`);
const BOARD = Array.from({ length: 24 }, (_, i) => i).join(',');
const CHECKED = '0'.repeat(24);

function playUrl() {
	const encoded = encodeURIComponent(OPTIONS.join('|'));
	return `/play?options=${encoded}&board=${BOARD}&checked=${CHECKED}`;
}

test.describe('play page cell text wrapping', () => {
	test('cells do not clip or truncate content', async ({ page }) => {
		await page.goto(playUrl());
		await page.locator('.grid').waitFor();

		const buttons = page.locator('.grid button');
		const count = await buttons.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const btn = buttons.nth(i);
			const overflow = await btn.evaluate((el) => getComputedStyle(el).overflow);
			expect(overflow, `cell ${i} should not clip overflow`).not.toContain('hidden');
		}
	});

	test('cells do not use ellipsis', async ({ page }) => {
		await page.goto(playUrl());
		await page.locator('.grid').waitFor();

		const spans = page.locator('.grid button span.leading-snug');
		const count = await spans.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const span = spans.nth(i);
			const textOverflow = await span.evaluate((el) => getComputedStyle(el).textOverflow);
			expect(textOverflow, `cell ${i} should not use ellipsis`).not.toBe('ellipsis');
		}
	});

	test('cells do not break words mid-character', async ({ page }) => {
		await page.goto(playUrl());
		await page.locator('.grid').waitFor();

		const spans = page.locator('.grid button span.leading-snug');
		const count = await spans.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const span = spans.nth(i);
			const wordBreak = await span.evaluate((el) => getComputedStyle(el).wordBreak);
			expect(wordBreak, `cell ${i} should not break-all`).not.toBe('break-all');
		}
	});
});
