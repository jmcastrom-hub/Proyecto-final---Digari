'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/catalog';
import { ProductImage } from '@/components/product-image';

type Line = { productId: string; variant?: string; quantity: number };
type ApiResult = { error?: string; trackingCode?: string; totalCrc?: number; status?: string; duplicate?: boolean };
const money = (n: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(n);

export function CartPage() {
  const [cart, setCart] = useState<Line[]>([]); const [products, setProducts] = useState<Product[]>([]); const [fulfillment, setFulfillment] = useState<'retiro demo'|'envío demo'>('retiro demo');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [receipt, setReceipt] = useState<ApiResult | null>(null);
  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('digari-cart') || '[]')); } catch { setCart([]); }
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.items || [])).catch(() => setError('No se pudo cargar el resumen.'));
  }, []);
  function save(next: Line[]) { setCart(next); localStorage.setItem('digari-cart', JSON.stringify(next)); window.dispatchEvent(new Event('digari-cart-updated')); }
  const detail = cart.map((line) => ({ line, product: products.find((product) => product.id === line.productId) })).filter((x): x is {line:Line;product:Product} => Boolean(x.product));
  const total = detail.reduce((sum, { line, product }) => sum + line.quantity * product.priceCrc, 0);
  async function confirm() {
    setError(''); setBusy(true);
    try {
      const idempotencyKey = sessionStorage.getItem('digari-order-key') || crypto.randomUUID();
      let trackingCode = sessionStorage.getItem('digari-order-code');
      if (!trackingCode) {
        const bytes = crypto.getRandomValues(new Uint8Array(24));
        trackingCode = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
      }
      sessionStorage.setItem('digari-order-key', idempotencyKey);
      sessionStorage.setItem('digari-order-code', trackingCode);
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart, fulfillment, idempotencyKey, trackingCode }) });
      const body: ApiResult = await response.json();
      if (!response.ok) throw new Error(body.error || 'No se pudo registrar el pedido.');
      setReceipt(body); save([]); sessionStorage.removeItem('digari-order-key');
      sessionStorage.removeItem('digari-order-code');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo completar la demostración.'); }
    finally { setBusy(false); }
  }
  if (receipt?.trackingCode) return <section className="container receipt-card"><span className="success-mark">✓</span><span className="eyebrow">PEDIDO DE DEMOSTRACIÓN</span><h2>Listo para seguir.</h2><p>Tu código privado de consulta:</p><code className="tracking-code">{receipt.trackingCode}</code><p>Guardalo ahora. Solo se muestra una vez y no representa una compra.</p><div className="receipt-total">Total demo <strong>{money(receipt.totalCrc || 0)}</strong></div><Link className="button" href={`/seguimiento?code=${receipt.trackingCode}`}>Consultar estado demo</Link></section>;
  if (cart.length === 0 && !error) return <section className="container empty-state page-empty"><span>◌</span><h2>Tu carrito está vacío.</h2><p>Agregá productos demo desde el catálogo para preparar un pedido de prueba.</p><Link className="button" href="/tienda">Explorar catálogo</Link></section>;
  return <section className="container cart-layout"><div className="cart-lines"><div className="section-heading"><div><span className="eyebrow">TU SELECCIÓN</span><h2>{detail.length} artículos</h2></div><Link className="text-button" href="/tienda">Seguir explorando</Link></div>
    {detail.map(({ line, product }) => <article className="cart-line" key={`${line.productId}-${line.variant}`}><div className="cart-art"><ProductImage productId={product.id} productName={product.name} /></div><div className="cart-product"><span className="product-meta">{product.family}</span><h3>{product.name}</h3><p>{product.variantLabel}: {line.variant || product.variants[0]}</p><strong>{money(product.priceCrc)}</strong></div><label className="quantity-control">Cantidad<input aria-label={`Cantidad de ${product.name}`} type="number" min="1" max="20" value={line.quantity} onChange={(e) => save(cart.map((x) => x.productId === line.productId && x.variant === line.variant ? { ...x, quantity: Number(e.target.value) } : x))} /></label><button className="text-button remove-line" onClick={() => save(cart.filter((x) => x.productId !== line.productId || x.variant !== line.variant))}>Quitar</button></article>)}
    {error && <div className="notice notice-error" role="alert">{error}</div>}</div>
    <aside className="order-summary"><span className="eyebrow">PEDIDO DE DEMOSTRACIÓN</span><h2>Resumen</h2><div className="summary-row"><span>Subtotal demo</span><strong>{money(total)}</strong></div><div className="summary-row"><span>Entrega</span><strong>Sin costo real</strong></div><label htmlFor="fulfillment">Condición de prueba</label><select id="fulfillment" value={fulfillment} onChange={(e) => setFulfillment(e.target.value as 'retiro demo'|'envío demo')}><option value="retiro demo">Retiro de demostración</option><option value="envío demo">Envío de demostración</option></select><div className="summary-total"><span>Total estimado demo</span><strong>{money(total)}</strong></div><ul className="summary-conditions"><li>No se procesa pago ni tarjeta.</li><li>No se reserva inventario real.</li><li>Retiro y envío son opciones ilustrativas.</li><li>El servidor calcula de nuevo el total.</li></ul><button className="button full-width" disabled={busy || detail.length !== cart.length} onClick={confirm}>{busy ? 'Registrando…' : 'Confirmar pedido demo'}</button><p className="micro-copy">Al confirmar, se crea una orden sintética persistida localmente. No se envía ningún paquete.</p></aside>
  </section>;
}
