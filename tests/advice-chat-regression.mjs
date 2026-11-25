import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const deps = process.env.QA_DEPS ?? path.join(process.env.TEMP ?? process.env.TMP ?? '', 'digari-ux-suite-deps');
const { chromium } = await import(pathToFileURL(path.join(deps, 'node_modules/playwright-core/index.mjs')));
const base = process.env.DIGARI_BASE_URL ?? 'http://localhost:3118';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const results = [];

try {
  await page.goto(`${base}/asesoria`, { waitUntil: 'networkidle' });
  const composer = page.getByLabel('Escribí tu mensaje');
  async function send(text) {
    const before = await page.locator('.chat-assistant').count();
    await composer.fill(text);
    await composer.press('Enter');
    await page.waitForFunction((count) => document.querySelectorAll('.chat-assistant').length > count, before, { timeout: 15000 });
    const last = page.locator('.chat-assistant').last();
    await last.waitFor();
    return last;
  }

  let answer = await send('¿Tienen bajos?');
  assert.match(await answer.innerText(), /Asesoría local/);
  assert.ok(await answer.locator('.advice-recommendation').count() >= 1);
  assert.ok(await answer.locator('.advice-recommendation img').count() >= 1);
  const bassPhotos = answer.locator('.advice-recommendation img');
  for (const photo of await bassPhotos.all()) await photo.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.chat-assistant:last-child .advice-recommendation img')].every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0), undefined, { timeout: 10000 });
  assert.ok(await answer.locator('a[href^="/productos/"]').count() >= 1);
  assert.match(await answer.innerText(), /₡/);
  await page.screenshot({ path: 'docs/qa/advice-chat-bajos.png', fullPage: true });
  results.push({ prompt: '¿Tienen bajos?', result: 'opción del catálogo con imagen, precio y ficha' });

  answer = await send('Busco un piano por ₡200 000');
  assert.match(await answer.innerText(), /teclados, que son una familia distinta/i);
  assert.equal(await answer.locator('.advice-recommendation').count(), 0);
  results.push({ prompt: 'Busco un piano por ₡200 000', result: 'aclara que no hay pianos demo y los distingue de teclado' });

  answer = await send('Busco una guitarra por ₡150 000');
  assert.ok(await answer.locator('.advice-recommendation').count() >= 2);
  const guitarCards = answer.locator('.advice-recommendation');
  const guitarText = await guitarCards.allInnerTexts();
  assert.ok(guitarText.some((value) => /guitarra acústica/i.test(value)));
  assert.ok(guitarText.some((value) => /guitarra eléctrica/i.test(value)));
  assert.ok(guitarText.every((value) => /₡/.test(value)));
  assert.equal(await answer.locator('.advice-recommendation img').count(), await guitarCards.count());
  results.push({ prompt: 'Busco una guitarra por ₡150 000', result: 'muestra opciones acústica y eléctrica bajo el presupuesto' });

  answer = await send('¿Hay algo más barato?');
  assert.match(await answer.innerText(), /No encuentro (?:otra ficha|una alternativa) (?:de esta categoría con existencias y precio inferior|más barata)/i);
  assert.equal(await answer.locator('.advice-recommendation').count(), 0);
  assert.equal(await composer.isVisible(), true);
  await page.screenshot({ path: 'docs/qa/advice-chat-regression.png', fullPage: true });
  results.push({ prompt: '¿Hay algo más barato?', result: 'conserva guitarras y no presenta productos fuera del límite inferior' });
  await page.getByRole('button', { name: 'Empezar de nuevo' }).click();
  answer = await send('Busco una guitarra acústica por ₡120 000');
  assert.ok(await answer.locator('.advice-recommendation').count() >= 1);
  assert.ok((await answer.locator('.advice-recommendation').allInnerTexts()).every((value) => /guitarra acústica/i.test(value)));
  results.push({ prompt: 'Busco una guitarra acústica por ₡120 000', result: 'la categoría específica prevalece sobre la categoría amplia guitarra' });
  console.log(JSON.stringify({ url: `${base}/asesoria`, chrome: browser.version(), results }, null, 2));
} finally {
  await browser.close();
}
