import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
assert(process.env.REVIEW_TOOLS, 'REVIEW_TOOLS must point to isolated browser tools.');
const { chromium } = require(resolve(process.env.REVIEW_TOOLS, 'playwright'));
const root = resolve('out'), output = resolve('design-review/launch-documents');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) return response.writeHead(403).end();
    for (const file of [path, path + '.html', resolve(path, 'index.html')]) {
      if (await stat(file).then(s => s.isFile()).catch(() => false)) {
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        return response.end(await readFile(file));
      }
    }
    response.writeHead(404).end();
  } catch { response.writeHead(500).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(), results = [];
try {
  for (const width of [1440, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    let checks = 0;
    let markStarted;
    const started = new Promise(resolve => { markStarted = resolve; });
    const errors = [];
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      if (url.pathname === '/health/ai') return route.fulfill({ status: 200, json: { ok: true, code: 'AI_READY' } });
      if (url.pathname === '/api/event') return route.fulfill({ status: 200, json: { ok: true } });
      if (url.pathname === '/api/check-document') {
        checks += 1;
        markStarted();
        if (checks === 1) return; // The browser deadline must release a stalled request.
        return route.fulfill({ status: 200, json: { ok: true, result: {
          verdict: 'ok', docTitle: 'Синтетический документ', summary: 'Проверка завершена.',
        } } });
      }
      return url.origin === origin ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/plan#document-check', { waitUntil: 'networkidle' });
    await page.clock.install();
    const doc = page.locator('#document-check');
    const filename = 'Справка_о_доходах_семьи_длинное_название_с_переводом_и_нотариальным_заверением.txt';
    await doc.getByLabel('Выбрать документ для проверки').setInputFiles({ name: filename, mimeType: 'text/plain', buffer: Buffer.from('Synthetic test document. No personal data.') });
    assert.equal(checks, 0, 'Selecting a file does not send it to the AI service');
    await doc.getByRole('button', { name: 'Проверить документ', exact: true }).click();
    await started;
    assert.equal(checks, 1);
    await page.clock.fastForward(90001);
    await doc.getByRole('alert').filter({ hasText: 'Проверка занимает слишком много времени' }).waitFor();
    assert.equal(await doc.getByText(filename, { exact: true }).count(), 1);
    await doc.getByRole('button', { name: 'Повторить проверку', exact: true }).click();
    const result = doc.getByRole('region', { name: 'Синтетический документ' });
    await result.waitFor();
    assert.equal(checks, 2);
    assert(await result.evaluate(el => document.activeElement === el), 'The completed result receives keyboard focus');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await doc.screenshot({ path: resolve(output, `document-${width}.png`) });

    await page.goto(origin + '/universities', { waitUntil: 'networkidle' });
    await page.getByLabel('Сразу к городу').selectOption('milano');
    const initiator = page.locator('[data-uni-card]').first().getByRole('button').first();
    await page.evaluate(() => { document.body.style.overflow = 'clip'; });
    await initiator.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Добавить к сравнению', exact: true }).click();
    const toggle = dialog.getByRole('button', { name: 'Убрать из сравнения', exact: true });
    await toggle.waitFor();
    assert(await toggle.evaluate(el => document.activeElement === el), 'Updating comparison must not reset modal focus');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert(await initiator.evaluate(el => document.activeElement === el));
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'clip');
    assert.deepEqual(errors, []);
    results.push({ width, timeoutRetry: true, retainedFile: true, resultFocus: true, stableModalFocus: true, noOverflow: true });
    await context.close();
  }
  await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
