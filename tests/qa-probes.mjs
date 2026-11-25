// Pruebas diagnósticas adicionales, independientes de los siete rubros.
export async function probes(page) {
  const observations = {};
  const link = page.locator.bind(page);
  await page.goto('/tienda');
  await link('#filter-category').selectOption('Instrumentos');
  await link('#filter-price').fill('100000');
  await link('.product-card h2 a[href^="/productos/acustica-luz"]').click();
  await link('.detail-copy a[href*="compare="]').click();
  await link('.product-card').first().waitFor();
  observations.filasAlVolverParaComparar = await link('.compare-item').count();
  observations.filtrosAlVolver = {
    categoria: await link('#filter-category').inputValue(),
    presupuesto: await link('#filter-price').inputValue()
  };
  await page.goBack();
  observations.rutaAtras = new URL(page.url()).pathname;
  await page.goForward();
  await link('button:has-text("Limpiar filtros")').first().click();
  observations.filtrosBorrados = {
    categoria: await link('#filter-category').inputValue(),
    presupuesto: await link('#filter-price').inputValue()
  };
  await page.goto('/servicios');
  await link('#service-desc').fill('Guitarra demo para afinación');
  await link('.service-form-panel button').click();
  await link('.notice-success a').click();
  await page.waitForFunction(() => document.querySelector('#tracking-code')?.value.length > 0);
  observations.tipoDesdeEnlaceDeServicio = await link('#tracking-kind').inputValue();
  await link('.tracking-form button').click();
  await link('.tracking-result,.tracking-form [role=alert]').first().waitFor();
  observations.consultaDirectaDeServicio = await link('.tracking-result').count() ? 'estado visible' : 'error visible';
  await page.goto('/productos/acustica-luz');
  await link('.product-actions button').click();
  await link('.product-actions [role=status]').waitFor();
  await page.route('**/api/products',async route => {
    await new Promise(resolve => setTimeout(resolve,1200));
    await route.continue();
  });
  const loading = link('text=Cargando tu bolsa…').waitFor({state:'visible',timeout:3000}).then(() => true).catch(() => false);
  await link('.cart-link').click();
  observations.cargaVisible = await loading;
  const zero = link('.order-summary .summary-total strong');
  observations.totalMientrasCarga = await zero.textContent();
  await link('.cart-line h3').waitFor();
  observations.totalAlCargar = await zero.textContent();
  await page.reload();
  await link('.cart-line h3').waitFor();
  observations.totalTrasRecargar = await link('.order-summary .summary-total strong').textContent();
  await page.evaluate(() => localStorage.setItem('digari-cart', '[]'));
  await page.reload();
  await link('.page-empty h2').filter({ hasText: 'Tu carrito está vacío.' }).waitFor();
  observations.vacioTrasRecargar = await link('.page-empty h2').innerText();
  return observations;
}
