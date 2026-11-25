import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { beforeEach, describe, it } from 'node:test';
import { db, listProducts } from '../lib/db';
import { _resetForTests, advanceStatus, ConflictError, createOrder, createService, InputError, lookupOrder, lookupService } from '../lib/orders';

describe('catálogo y pedidos demo', () => {
  beforeEach(() => _resetForTests());
  it('precarga 15 productos sintéticos de distintas familias', () => {
    const items = listProducts(); assert.equal(items.length, 15);
    assert.ok(items.some((item) => item.family === 'Guitarra acústica'));
    assert.ok(items.some((item) => item.family === 'Parlante'));
    assert.ok(items.every((item) => item.modelRef && item.modelRef !== 'generic'));
    assert.ok(items.find((item) => item.id === 'monitor-alfar')?.audioNotes?.connections.length);
  });
  it('filtra catálogo por presupuesto y estilo', () => {
    const results = listProducts({ minPrice: 25000, maxPrice: 100000, style: 'folk' });
    assert.ok(results.length > 0);
    assert.ok(results.every((item) => item.priceCrc >= 25000 && item.priceCrc <= 100000 && item.style.includes('folk')));
  });
  it('recalcula total y crea seguimiento privado', () => {
    const order = createOrder({ items: [{ productId: 'acustica-luz', variant: 'Natural', quantity: 2 }], fulfillment: 'retiro demo', idempotencyKey: '41a3f1cc-23b6-45e8-87cd-f129e75a12d8', trackingCode: 'Z'.repeat(32) });
    assert.equal(order.totalCrc, 169800); assert.ok('trackingCode' in order && order.trackingCode);
    const tracked = lookupOrder('trackingCode' in order ? order.trackingCode : '');
    assert.equal(tracked?.status, 'recibido'); assert.equal(tracked?.lines[0].quantity, 2);
  });
  it('mantiene el pedido consultable desde un proceso nuevo de SQLite', () => {
    const trackingCode = 'P'.repeat(32);
    createOrder({ items: [{ productId: 'acustica-luz', variant: 'Natural', quantity: 1 }], fulfillment: 'retiro demo', idempotencyKey: '42a3f1cc-23b6-45e8-87cd-f129e75a12d9', trackingCode });
    const reopened = spawnSync(process.execPath, ['-e', "const {lookupOrder}=require('./.test-dist/lib/orders.js');const r=lookupOrder(process.env.DIGARI_TEST_TRACKING);if(!r)process.exit(2);process.stdout.write(r.status)"], { encoding: 'utf8', env: { ...process.env, DIGARI_TEST_TRACKING: trackingCode } });
    assert.equal(reopened.status, 0, reopened.stderr); assert.equal(reopened.stdout, 'recibido');
  });
  it('rechaza cantidad inválida y stock insuficiente sin alterar stock', () => {
    assert.throws(() => createOrder({ items: [{ productId: 'acustica-luz', quantity: 0 }], fulfillment: 'retiro demo', idempotencyKey: '41a3f1cc-23b6-45e8-87cd-f129e75a12d8', trackingCode:'A'.repeat(32) }), InputError);
    assert.throws(() => createOrder({ items: [{ productId: 'acustica-luz', quantity: 9 }], fulfillment: 'retiro demo', idempotencyKey: '51a3f1cc-23b6-45e8-87cd-f129e75a12d8', trackingCode:'B'.repeat(32) }), ConflictError);
    assert.equal(listProducts().find((p) => p.id === 'acustica-luz')?.stock, 8);
  });
  it('registra una sola vez pedidos con la misma clave', () => {
    const payload = { items: [{ productId: 'ukelele-sol', quantity: 1 }], fulfillment: 'envío demo', idempotencyKey: '61a3f1cc-23b6-45e8-87cd-f129e75a12d8', trackingCode: 'C'.repeat(32) };
    const first = createOrder(payload); const second = createOrder(payload);
    assert.equal(first.duplicate, false);
    assert.equal(second.duplicate, true);
    assert.equal(second.trackingCode, payload.trackingCode);
    assert.throws(() => createOrder({ ...payload, trackingCode: 'D'.repeat(32) }), ConflictError);
    assert.equal(Number((db.prepare('SELECT COUNT(*) AS count FROM orders').get() as { count: number }).count), 1);
    assert.equal(listProducts().find((p) => p.id === 'ukelele-sol')?.stock, 11);
  });
  it('valida código privado, operador y transición consecutiva', () => {
    const order = createOrder({ items: [{ productId: 'cable-pulso', quantity: 1 }], fulfillment: 'retiro demo', idempotencyKey: '71a3f1cc-23b6-45e8-87cd-f129e75a12d8', trackingCode:'D'.repeat(32) });
    assert.equal(lookupOrder('A'.repeat(32)), undefined);
    const code = 'trackingCode' in order ? order.trackingCode : '';
    assert.throws(() => advanceStatus('pedido', code, 'entregado', 'local-demo-only'), ConflictError);
    assert.equal(advanceStatus('pedido', code, 'en preparación', 'local-demo-only').status, 'en preparación');
    assert.throws(() => advanceStatus('pedido', code, 'listo/enviado', 'incorrecto'), InputError);
  });
});

describe('solicitudes de taller demo', () => {
  beforeEach(() => _resetForTests());
  it('persiste solicitud y valida transiciones', () => {
    const service = createService({ type: 'afinación', description: 'Guitarra demo con cuerda floja.' });
    assert.equal(lookupService(service.trackingCode)?.status, 'recibido');
    assert.equal(advanceStatus('servicio', service.trackingCode, 'diagnóstico', 'local-demo-only').status, 'diagnóstico');
    assert.throws(() => advanceStatus('servicio', service.trackingCode, 'entregado', 'local-demo-only'), ConflictError);
    assert.throws(() => createService({ type: 'afinación', description: '' }), InputError);
  });
});
