import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const deps = process.env.QA_DEPS;
const { chromium } = await import(pathToFileURL(path.join(deps, 'node_modules/playwright-core/index.mjs')));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://localhost:3117/', { waitUntil: 'networkidle' });
    const cards = page.locator('.category-tile');
    assert.equal(await cards.count(), 4);
    const expected = ['Instrumentos', 'Audio profesional', 'Home Studio', 'DJ'];
    for (let i = 0; i < 4; i++) {
      const card = cards.nth(i);
      await card.scrollIntoViewIfNeeded();
      const title = await card.locator('h3').innerText();
      const description = await card.locator('p').innerText();
      const href = await card.getAttribute('href');
      assert.ok(title && description && href.includes(encodeURIComponent(expected[i])));
      assert.equal(await card.evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(33, 31, 28)');
      await card.hover();
      assert.equal(await card.evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(38, 34, 29)');
      await card.focus();
      assert.ok(await card.evaluate(e => e.matches(':focus-visible') || e === document.activeElement));
    }
    if (viewport.width === 1440) await page.locator('.category-grid').screenshot({ path: 'docs/qa/evidence/category-tiles-desktop.png' });
    if (viewport.width === 390) await page.locator('.category-grid').screenshot({ path: 'docs/qa/evidence/category-tiles-mobile.png' });
    await page.close();
  }
  console.log('4 tarjetas verificadas en escritorio y mÃ³vil, incluido hover y foco.');
} finally { await browser.close(); }

