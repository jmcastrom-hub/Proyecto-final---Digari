import { randomBytes, randomUUID } from 'node:crypto';

const base = process.env.DIGARI_BASE_URL || 'http://127.0.0.1:3000';
const operatorToken = process.env.DIGARI_DEMO_OPERATOR_TOKEN;
if (!operatorToken) throw new Error('Define DIGARI_DEMO_OPERATOR_TOKEN en esta terminal y reinicia el servidor demo.');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const json = (body) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

for (const route of ['/', '/tienda', '/productos/acustica-luz', '/carrito', '/seguimiento', '/servicios', '/contacto', '/favoritos', '/promos', '/estudio', '/asesoria']) {
  const response = await fetch(base + route);
  assert(response.status === 200, `${route}: HTTP ${response.status}`);
}
const catalog = await fetch(base + '/api/products').then((response) => response.json());
assert(catalog.items.every((item) => item.modelRef && item.modelRef !== 'generic'), 'Faltan referencias 3D en el catálogo público.');
assert(catalog.items.find((item) => item.id === 'monitor-alfar')?.audioNotes?.connections?.length, 'Faltan notas de uso/conexión para equipo de audio.');
const advice = await fetch(base + '/api/advice', json({ budgetCrc: 80000, family: 'Guitarra acústica', style: 'folk', use: 'iniciacion', question: '¿Cuál me recomiendas?' })).then((response) => response.json());
assert(advice.mode === 'local' && advice.recommendations.length <= 3 && advice.recommendations.every((item) => item.productId === 'acustica-luz'), 'La asesoría local no filtró el catálogo correctamente.');
const insufficientAdvice = await fetch(base + '/api/advice', json({ budgetCrc: 1000, family: 'Guitarra acústica', use: 'iniciacion' })).then((response) => response.json());
assert(insufficientAdvice.mode === 'local' && insufficientAdvice.recommendations.length === 0 && /flexibilizar/.test(insufficientAdvice.message), 'La asesoría debe explicar con tacto cuando el presupuesto no alcanza.');
const invalidAdvice = await fetch(base + '/api/advice', json({ budgetCrc: -1, family: 'Guitarra acústica', use: 'iniciacion' }));
assert(invalidAdvice.status === 400, 'La asesoría debe rechazar un presupuesto inválido.');
assert(catalog.total === 15, 'El catálogo no devolvió 15 fichas.');
const photoIds = new Set(['acustica-luz', 'electrica-bruma', 'bajo-marea', 'teclado-nube', 'ukelele-sol', 'flauta-rio', 'cable-pulso', 'cana-viento']);
for (const item of catalog.items) {
  const photo = photoIds.has(item.id);
  const image = await fetch(`${base}${photo ? `/product-photos/${item.id}.webp` : `/products/${item.id}.svg`}`);
  assert(image.status === 200 && image.headers.get('content-type')?.includes(photo ? 'image/webp' : 'image/svg+xml'), `La imagen de ${item.id} no está disponible.`);
}
const filterError = await fetch(base + '/api/products?minPrice=90000&maxPrice=10000');
assert(filterError.status === 400, 'El API debe rechazar un rango CRC imposible.');

const trackingCode = randomBytes(24).toString('base64url');
const orderPayload = { items: [{ productId: 'ukelele-sol', variant: 'Miel', quantity: 1 }], fulfillment: 'retiro demo', idempotencyKey: randomUUID(), trackingCode };
const orderResponse = await fetch(base + '/api/orders', json(orderPayload));
const order = await orderResponse.json();
assert(orderResponse.status === 201 && order.trackingCode === trackingCode, 'No se creó pedido demo.');
const retry = await fetch(base + '/api/orders', json(orderPayload));
assert(retry.status === 200 && (await retry.json()).duplicate, 'La confirmación repetida no fue idempotente.');
const badVariant = await fetch(base + '/api/orders', json({ ...orderPayload, idempotencyKey: randomUUID(), trackingCode: randomBytes(24).toString('base64url'), items: [{ productId: 'acustica-luz', variant: 'Missing demo variant', quantity: 1 }] }));
assert(badVariant.status === 400, 'The API must reject an unknown variant.');
const wrongRetry = await fetch(base + '/api/orders', json({ ...orderPayload, trackingCode: randomBytes(24).toString('base64url') }));
assert(wrongRetry.status === 409, 'Una clave repetida no debe revelar otro código de seguimiento.');
const lookup = await fetch(base + '/api/orders/lookup', json({ trackingCode })).then((response) => response.json());
assert(lookup.status === 'recibido', 'No se encontró el pedido por su código privado.');
const invalidToken = await fetch(base + '/api/operator/status', json({ kind: 'pedido', trackingCode, nextStatus: 'en preparaci\u00f3n', operatorToken: 'invalid-token' }));
assert(invalidToken.status === 400, 'The API must reject an invalid operator token.');
const unchangedOrder = await fetch(base + '/api/orders/lookup', json({ trackingCode })).then((response) => response.json());
assert(unchangedOrder.status === 'recibido', 'An invalid token must not advance the order.');
const orderStatus = await fetch(base + '/api/operator/status', json({ kind: 'pedido', trackingCode, nextStatus: 'en preparación', operatorToken })).then((response) => response.json());
assert(orderStatus.status === 'en preparación', 'No se actualizó el estado del pedido.');

const service = await fetch(base + '/api/services', json({ type: 'afinación', description: 'Guitarra demo de la prueba.' })).then((response) => response.json());
assert(service.trackingCode, 'No se creó solicitud de servicio.');
const serviceLookup = await fetch(base + '/api/services/lookup', json({ trackingCode: service.trackingCode })).then((response) => response.json());
assert(serviceLookup.status === 'recibido', 'No se encontró la solicitud por su código privado.');
const serviceStatus = await fetch(base + '/api/operator/status', json({ kind: 'servicio', trackingCode: service.trackingCode, nextStatus: 'diagnóstico', operatorToken })).then((response) => response.json());
assert(serviceStatus.status === 'diagnóstico', 'No se actualizó el estado del servicio.');

const stockError = await fetch(base + '/api/orders', json({ items: [{ productId: 'acustica-luz', quantity: 20 }], fulfillment: 'retiro demo', idempotencyKey: randomUUID(), trackingCode: randomBytes(24).toString('base64url') }));
assert(stockError.status === 409, 'El API debe rechazar stock demo insuficiente.');
console.log('API smoke OK: 11 páginas, catálogo/filtros, asesoría local/validación, pedido idempotente, código privado, servicio y transiciones, stock insuficiente.');
