import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { probes } from './qa-probes.mjs';

const { chromium } = await import(pathToFileURL(path.join(process.env.QA_DEPS, 'node_modules/playwright-core/index.mjs')));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ baseURL: process.env.QA_URL || 'http://127.0.0.1:3115' });
try {
  const page = await context.newPage();
  const findings = await probes(page);
  assert.equal(findings.filasAlVolverParaComparar, 1);
  assert.deepEqual(findings.filtrosAlVolver, { categoria: 'Instrumentos', presupuesto: '100000' });
  assert.equal(findings.rutaAtras, '/productos/acustica-luz');
  assert.deepEqual(findings.filtrosBorrados, { categoria: '', presupuesto: '' });
  assert.equal(findings.tipoDesdeEnlaceDeServicio, 'servicio');
  assert.equal(findings.consultaDirectaDeServicio, 'estado visible');
  assert.equal(findings.totalMientrasCarga, '₡84 900');
  assert.equal(findings.totalTrasRecargar, '₡84 900');
  assert.equal(findings.cargaVisible, true);
  assert.equal(findings.vacioTrasRecargar, 'Tu carrito está vacío.');

  const catalog = await page.request.get('/api/products');
  const { items } = await catalog.json();
  assert.equal(items.length, 15);
  for (const item of items) {
    await page.goto('/productos/' + item.id);
    const image = page.locator('.detail-art img');
    await image.evaluate((element) => element.decode());
    const source = new URL(await image.getAttribute('src'), 'http://localhost');
    assert.equal(source.searchParams.get('url') || source.pathname, `/product-photos/${item.id}.webp`);
    assert.match(await page.locator('.detail-art small').innerText(), /FOTOGRAFÍA/);
  }
  console.log('Cinco regresiones y 15 fotos verificadas en ficha', findings);
} finally {
  await browser.close();
}
