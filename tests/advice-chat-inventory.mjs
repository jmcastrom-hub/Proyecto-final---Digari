import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const deps = process.env.QA_DEPS ?? path.join(process.env.TEMP ?? process.env.TMP ?? '', 'digari-ux-suite-deps');
const { chromium } = await import(pathToFileURL(path.join(deps, 'node_modules/playwright-core/index.mjs')));
const base = process.env.DIGARI_BASE_URL ?? 'http://localhost:3118';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const uuid = '123e4567-e89b-12d3-a456-426614174000';
const results = [];
let clientIndex = 10;

async function newChat({ savedPreferences } = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `198.51.100.${clientIndex++}` });
  const calls = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/api/advice') && request.method() === 'POST') calls.push(JSON.parse(request.postData() ?? '{}'));
  });
  if (savedPreferences) await page.addInitScript(({ savedPreferences, uuid }) => {
    localStorage.setItem('digari-advice-chat-v1', JSON.stringify({
      conversationId: uuid,
      preferences: savedPreferences,
      turns: [{ role: 'assistant', text: 'Conversación previa guardada.' }],
    }));
  }, { savedPreferences, uuid });
  await page.goto(`${base}/asesoria`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.advice-preferences, #advice-budget, #advice-family, #advice-use, #advice-style').count(), 0);
  assert.equal(await page.getByLabel('Escribí tu mensaje').isVisible(), true);
  assert.equal(await page.getByRole('button', { name: 'Enviar' }).isVisible(), true);
  return { context, page, calls };
}

async function send(page, text) {
  const count = await page.locator('.chat-assistant').count();
  await page.getByLabel('Escribí tu mensaje').fill(text);
  await page.getByLabel('Escribí tu mensaje').press('Enter');
  await page.waitForFunction((before) => document.querySelectorAll('.chat-assistant').length > before, count, { timeout: 15000 });
  return page.locator('.chat-assistant').last();
}

async function verifyCards(answer, { min = 1, max = 3, above = false } = {}) {
  const cards = answer.locator(above ? '.advice-overbudget .advice-recommendation' : ':scope > .advice-recommendations > .advice-recommendation');
  const count = await cards.count();
  assert.ok(count >= min && count <= max, `Cantidad de tarjetas: ${count}`);
  for (const card of await cards.all()) {
    const img = card.locator('img');
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((image) => image.decode());
    assert.ok(await img.getAttribute('alt'));
    assert.ok(await card.locator('h3 a[href^="/productos/"]').count());
    assert.match(await card.innerText(), /₡[\d\u00a0,.]+/);
  }
  return cards;
}

try {
  const { context, page, calls } = await newChat({ savedPreferences: { budgetCrc: '0', family: 'Bajo', style: 'funk', use: 'ensayo' } });
  let answer = await send(page, '¿Qué instrumentos tenés?');
  const instrumentSummary = await answer.innerText();
  for (const family of ['Guitarra acústica', 'Guitarra eléctrica', 'Bajo', 'Teclado', 'Ukelele', 'Viento']) assert.ok(instrumentSummary.includes(family), `Falta la familia ${family}`);
  await verifyCards(answer, { min: 3 });
  assert.ok(!('budgetCrc' in calls.at(-1)) && !('family' in calls.at(-1)) && !('style' in calls.at(-1)) && !('use' in calls.at(-1)), 'La consulta general debe ignorar preferencias guardadas');
  assert.ok(await answer.locator('.mode-chip.local').count());
  results.push('Inventario de instrumentos sin filtros heredados: pasó.');

  answer = await send(page, '¿Cuál me recomendás para empezar?');
  const starterCards = await verifyCards(answer, { min: 3 });
  const starterIds = await starterCards.evaluateAll((cards) => cards.map((card) => card.querySelector('h3 a')?.getAttribute('href')));
  const starterPrices = await starterCards.evaluateAll((cards) => cards.map((card) => Number(card.querySelector('strong')?.textContent?.replace(/\D/g, '') ?? 0)));
  results.push('Recomendación para empezar sin formulario de preferencias: pasó.');

  answer = await send(page, '¿Hay algo más barato?');
  const cheapCards = answer.locator(':scope > .advice-recommendations > .advice-recommendation');
  const cheapCount = await cheapCards.count();
  assert.ok(cheapCount <= 3);
  const reference = Math.max(...starterPrices);
  const cheapData = await cheapCards.evaluateAll((cards) => cards.map((card) => ({ href: card.querySelector('h3 a')?.getAttribute('href'), price: Number(card.querySelector('strong')?.textContent?.replace(/\D/g, '') ?? 0) })));
  assert.ok(cheapData.every((item) => !starterIds.includes(item.href) && item.price < reference), JSON.stringify({ starterIds, starterPrices, reference, cheapData, message: await answer.innerText() }));
  results.push(`Seguimiento «más barato»: ${cheapCount} opciones, ninguna repetida y todas bajo ₡${reference.toLocaleString('es-CR')}.`);

  await page.getByRole('button', { name: 'Empezar de nuevo' }).click();
  answer = await send(page, 'Busco un bajo máximo ₡120 000');
  assert.equal(await answer.locator(':scope > .advice-recommendations > .advice-recommendation').count(), 0);
  assert.match(await answer.innerText(), /superan el tope/i);
  const overCards = await verifyCards(answer, { min: 1, above: true });
  const overPrices = await overCards.evaluateAll((cards) => cards.map((card) => Number(card.querySelector('strong')?.textContent?.replace(/\D/g, '') ?? 0)));
  assert.ok(overPrices.every((price) => price > 120000));
  results.push('Tope ₡120 000: ninguna coincidencia fuera del tope se presentó como elegible; alternativas separadas.');

  answer = await send(page, '¿Qué equipo tenés?');
  const equipmentSummary = await answer.innerText();
  assert.match(equipmentSummary, /en 15 familias/);
  for (const family of ['Cable', 'Guitarra', 'Interfaz']) assert.ok(equipmentSummary.includes(family));
  assert.equal('budgetCrc' in calls.at(-1), false);
  assert.equal('family' in calls.at(-1), false);
  assert.equal('use' in calls.at(-1), false);
  results.push('Consulta general posterior al tope: vuelve al inventario completo y omite filtros antiguos.');
  await page.screenshot({ path: 'docs/qa/advice-chat-inventory.png', fullPage: true });
  await context.close();

  const fresh = await newChat();
  answer = await send(fresh.page, '¿Qué equipo tenés?');
  assert.match(await answer.innerText(), /familias:/i);
  await verifyCards(answer, { min: 3 });
  const firstEquipmentIds = await answer.locator('.advice-recommendation h3 a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  answer = await send(fresh.page, 'mostrame más');
  const moreCards = await verifyCards(answer, { min: 1 });
  const moreIds = await moreCards.evaluateAll((cards) => cards.map((card) => card.querySelector('h3 a')?.getAttribute('href')));
  assert.ok(moreIds.every((id) => !firstEquipmentIds.includes(id)));
  assert.match(await answer.innerText(), /mostrame más|más opciones/i);
  results.push('«Mostrame más»: mostró fichas nuevas sin repetir las primeras.');
  await fresh.context.close();

  const zero = await newChat();
  answer = await send(zero.page, 'Busco un bajo máximo ₡0');
  assert.match(await answer.innerText(), /₡0/);
  const zeroAlternatives = await verifyCards(answer, { min: 1, above: true });
  const zeroPrices = await zeroAlternatives.evaluateAll((cards) => cards.map((card) => Number(card.querySelector('strong')?.textContent?.replace(/\D/g, '') ?? 0)));
  assert.ok(zeroPrices.every((price) => price > 0));
  results.push('Tope explícito ₡0: pasó y las alternativas quedaron rotuladas fuera del tope.');
  await zero.context.close();

  console.log(JSON.stringify({ url: `${base}/asesoria`, chrome: browser.version(), results }, null, 2));
} finally {
  await browser.close();
}
