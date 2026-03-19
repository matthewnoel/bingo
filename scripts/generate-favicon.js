import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import toIco from 'to-ico';
import { chromium } from 'playwright';

const EMOJI = '✅';
const RENDER_SIZE = 512;

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = join(__dirname, '..', 'static');

const pngVariants = [
	{ name: 'favicon-32x32.png', size: 32 },
	{ name: 'apple-touch-icon.png', size: 180 },
	{ name: 'favicon-192x192.png', size: 192 },
	{ name: 'favicon-512x512.png', size: 512 }
];

function buildSvg(size) {
	const fontSize = Math.round(size * 0.75);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${fontSize}">${EMOJI}</text>
</svg>`;
}

async function renderEmojiToPng(emoji, size) {
	const browser = await chromium.launch();
	const page = await browser.newPage({
		viewport: { width: size, height: size },
		deviceScaleFactor: 1
	});
	await page.setContent(
		`<html><body style="margin:0;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px"><span style="font-size:${Math.round(size * 0.85)}px;line-height:1">${emoji}</span></body></html>`
	);
	const screenshot = await page.screenshot({ type: 'png', omitBackground: true });
	await browser.close();
	return screenshot;
}

async function main() {
	await mkdir(staticDir, { recursive: true });

	const faviconSvg = buildSvg(64);
	await writeFile(join(staticDir, 'favicon.svg'), faviconSvg);
	console.log('wrote favicon.svg');

	console.log('rendering emoji with browser...');
	const basePng = await renderEmojiToPng(EMOJI, RENDER_SIZE);

	for (const { name, size } of pngVariants) {
		const buf = await sharp(basePng).resize(size, size).png().toBuffer();
		await writeFile(join(staticDir, name), buf);
		console.log(`wrote ${name}`);
	}

	const ico32 = await sharp(basePng).resize(32, 32).png().toBuffer();
	const icoBuffer = await toIco([ico32]);
	await writeFile(join(staticDir, 'favicon.ico'), icoBuffer);
	console.log('wrote favicon.ico');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
