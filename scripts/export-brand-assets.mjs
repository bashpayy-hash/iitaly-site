import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const mark = JSON.parse(await readFile('src/components/brand/mark.json', 'utf8'));
const paths = (monochrome = false) => `<path d="${mark.fold}" fill="${monochrome ? 'currentColor' : mark.green}"/><path d="${mark.arc}" fill="${monochrome ? 'currentColor' : mark.red}"/>`;
const svg = (content, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.viewBox}" fill="none" ${extra}>${content}</svg>\n`;
await mkdir('public/brand', { recursive: true });
await writeFile('public/brand/iitaly-mark.svg', svg(paths()));
await writeFile('public/brand/iitaly-mark-mono.svg', svg(paths(true), 'color="#141413"'));
const icon = svg(`<rect width="64" height="64" rx="12" fill="#FFFDF9"/>${paths()}`);
await writeFile('src/app/icon.svg', icon);
const apple = svg(`<rect width="64" height="64" fill="#FFFDF9"/><g transform="translate(8 8) scale(.75)">${paths()}</g>`);
await sharp(Buffer.from(apple)).resize(180, 180).png().toFile('src/app/apple-icon.png');
console.log('Exported matching vector marks, favicon and 180px home-screen icon.');
