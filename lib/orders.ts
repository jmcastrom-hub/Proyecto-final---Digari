import { db, getProduct, withTransaction } from './db';
import { newId, newTrackingCode, trackingHash, validIdempotencyKey, validTrackingCode } from './tracking';
import { products as importProductsSnapshot } from './catalog';

export const orderStates = ['recibido', 'en preparación', 'listo/enviado', 'entregado'] as const;
export const serviceStates = ['recibido', 'diagnóstico', 'en proceso', 'listo', 'entregado'] as const;
export type OrderState = typeof orderStates[number];
export type ServiceState = typeof serviceStates[number];

export type OrderInput = { items: Array<{ productId: string; variant?: string; quantity: number }>; fulfillment: 'retiro demo' | 'envío demo'; idempotencyKey: string; trackingCode: string };
export class InputError extends Error {}
export class ConflictError extends Error {}

export function createOrder(input: unknown) {
  if (!input || typeof input !== 'object') throw new InputError('Revisa los datos del pedido.');
  const body = input as Partial<OrderInput>;
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 12) throw new InputError('Agrega entre 1 y 12 productos.');
  if (body.fulfillment !== 'retiro demo' && body.fulfillment !== 'envío demo') throw new InputError('Selecciona retiro o envío de demostración.');
  if (!validIdempotencyKey(body.idempotencyKey)) throw new InputError('La clave de confirmación no es válida.');
  if (!validTrackingCode(body.trackingCode)) throw new InputError('El código de seguimiento no es válido.');
  const existing = db.prepare('SELECT id, status, total_crc FROM orders WHERE idempotency_key=?').get(body.idempotencyKey) as { id: string; status: string; total_crc: number } | undefined;
  if (existing) {
    const tokenMatches = db.prepare('SELECT 1 AS matched FROM orders WHERE id=? AND tracking_hash=?').get(existing.id, trackingHash(body.trackingCode));
    if (!tokenMatches) throw new ConflictError('La confirmación ya existe; usa el código privado de esa orden.');
    return { duplicate: true, trackingCode: body.trackingCode, status: existing.status, totalCrc: existing.total_crc };
  }
  const items = body.items.map((item) => {
    if (!item || typeof item.productId !== 'string' || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw new InputError('Cada cantidad debe ser un entero entre 1 y 20.');
    const product = getProduct(item.productId);
    if (!product) throw new InputError('Uno de los productos ya no está disponible.');
    if (item.variant && !product.variants.includes(item.variant)) throw new InputError(`La variante de ${product.name} no es válida.`);
    if (item.quantity > product.stock) throw new ConflictError(`No hay existencias demo suficientes de ${product.name}.`);
    return { product, variant: item.variant ?? null, quantity: item.quantity };
  });
  const totalCrc = items.reduce((sum, item) => sum + item.product.priceCrc * item.quantity, 0);
  if (!Number.isSafeInteger(totalCrc)) throw new InputError('El total excede el límite permitido.');
  const id = newId();
  const code = body.trackingCode;
  const now = new Date().toISOString();
  withTransaction(() => {
    for (const item of items) {
      const update = db.prepare('UPDATE products SET stock=stock-? WHERE id=? AND stock>=?').run(item.quantity, item.product.id, item.quantity);
      if (Number(update.changes) !== 1) throw new ConflictError(`No hay existencias demo suficientes de ${item.product.name}.`);
    }
    db.prepare('INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, trackingHash(code), body.idempotencyKey!, orderStates[0], body.fulfillment!, totalCrc, now);
    const line = db.prepare('INSERT INTO order_lines (order_id,product_id,product_name,variant,quantity,unit_price_crc) VALUES (?,?,?,?,?,?)');
    for (const item of items) line.run(id, item.product.id, item.product.name, item.variant, item.quantity, item.product.priceCrc);
    db.prepare('INSERT INTO order_events (order_id,from_status,to_status,actor,created_at) VALUES (?,NULL,?,?,?)').run(id, orderStates[0], 'cliente-demo', now);
  });
  return { duplicate: false, trackingCode: code, totalCrc, status: orderStates[0] };
}

export function lookupOrder(code: string) {
  const order = db.prepare('SELECT id,status,total_crc,fulfillment,created_at FROM orders WHERE tracking_hash=?').get(trackingHash(code)) as { id: string; status: string; total_crc: number; fulfillment: string; created_at: string } | undefined;
  if (!order) return undefined;
  const lines = db.prepare('SELECT product_name,variant,quantity,unit_price_crc FROM order_lines WHERE order_id=?').all(order.id);
  const events = db.prepare('SELECT from_status,to_status,created_at FROM order_events WHERE order_id=? ORDER BY id').all(order.id);
  return { status: order.status, totalCrc: order.total_crc, fulfillment: order.fulfillment, createdAt: order.created_at, lines, events };
}

export function createService(input: unknown) {
  if (!input || typeof input !== 'object') throw new InputError('Revisa los datos del servicio.');
  const body = input as { type?: string; description?: string };
  const allowed = ['afinación', 'calibración', 'restauración', 'reparación'];
  if (!body.type || !allowed.includes(body.type)) throw new InputError('Selecciona un tipo de servicio válido.');
  if (typeof body.description !== 'string' || !body.description.trim() || body.description.length > 500) throw new InputError('Describe el instrumento en un máximo de 500 caracteres.');
  const id = newId(); const code = newTrackingCode(); const now = new Date().toISOString();
  withTransaction(() => {
    db.prepare('INSERT INTO service_requests VALUES (?,?,?,?,?,?)').run(id, trackingHash(code), body.type!, body.description!.trim(), serviceStates[0], now);
    db.prepare('INSERT INTO service_events (request_id,from_status,to_status,actor,created_at) VALUES (?,NULL,?,?,?)').run(id, serviceStates[0], 'cliente-demo', now);
  });
  return { serviceId: id, trackingCode: code, status: serviceStates[0] };
}

export function lookupService(code: string) {
  const request = db.prepare('SELECT id,type,status,created_at FROM service_requests WHERE tracking_hash=?').get(trackingHash(code)) as { id: string; type: string; status: string; created_at: string } | undefined;
  if (!request) return undefined;
  const events = db.prepare('SELECT from_status,to_status,created_at FROM service_events WHERE request_id=? ORDER BY id').all(request.id);
  return { type: request.type, status: request.status, createdAt: request.created_at, events };
}

export function advanceStatus(kind: unknown, code: unknown, nextStatus: unknown, token: unknown) {
  const expected = process.env.DIGARI_DEMO_OPERATOR_TOKEN || (process.env.NODE_ENV !== 'production' ? 'local-demo-only' : '');
  if (!expected || token !== expected) throw new InputError('Código de operador inválido.');
  if (!validTrackingCode(code)) throw new InputError('Código de seguimiento no válido.');
  const now = new Date().toISOString();
  if (kind === 'pedido') {
    if (!orderStates.includes(nextStatus as OrderState)) throw new InputError('Pedido o estado no válido.');
    const found = db.prepare('SELECT id,status FROM orders WHERE tracking_hash=?').get(trackingHash(code)) as { id: string; status: OrderState } | undefined;
    if (!found) throw new InputError('No encontramos ese pedido demo.');
    const id = found.id;
    const order = db.prepare('SELECT status FROM orders WHERE id=?').get(id) as { status: OrderState } | undefined;
    if (!order) throw new InputError('No encontramos ese pedido demo.');
    if (orderStates.indexOf(nextStatus as OrderState) !== orderStates.indexOf(order.status) + 1) throw new ConflictError('El estado debe avanzar un paso a la vez.');
    withTransaction(() => {
      db.prepare('UPDATE orders SET status=? WHERE id=?').run(nextStatus as OrderState, id);
      db.prepare('INSERT INTO order_events (order_id,from_status,to_status,actor,created_at) VALUES (?,?,?,?,?)').run(id, order.status, nextStatus as OrderState, 'operador-demo', now);
    });
    return { status: nextStatus };
  }
  if (kind === 'servicio') {
    if (!serviceStates.includes(nextStatus as ServiceState)) throw new InputError('Servicio o estado no válido.');
    const found = db.prepare('SELECT id,status FROM service_requests WHERE tracking_hash=?').get(trackingHash(code)) as { id: string; status: ServiceState } | undefined;
    if (!found) throw new InputError('No encontramos ese servicio demo.');
    const id = found.id;
    const request = db.prepare('SELECT status FROM service_requests WHERE id=?').get(id) as { status: ServiceState } | undefined;
    if (!request) throw new InputError('No encontramos ese servicio demo.');
    if (serviceStates.indexOf(nextStatus as ServiceState) !== serviceStates.indexOf(request.status) + 1) throw new ConflictError('El estado debe avanzar un paso a la vez.');
    withTransaction(() => {
      db.prepare('UPDATE service_requests SET status=? WHERE id=?').run(nextStatus as ServiceState, id);
      db.prepare('INSERT INTO service_events (request_id,from_status,to_status,actor,created_at) VALUES (?,?,?,?,?)').run(id, request.status, nextStatus as ServiceState, 'operador-demo', now);
    });
    return { status: nextStatus };
  }
  throw new InputError('Tipo de registro inválido.');
}

export function _resetForTests() {
  withTransaction(() => {
    db.exec('DELETE FROM order_events; DELETE FROM order_lines; DELETE FROM orders; DELETE FROM service_events; DELETE FROM service_requests;');
    for (const p of importProductsSnapshot) db.prepare('UPDATE products SET stock=? WHERE id=?').run(p.stock, p.id);
  });
}
