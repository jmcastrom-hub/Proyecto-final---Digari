import type { Metadata } from 'next';
import Link from 'next/link';
import { getProduct } from '@/lib/db';
import { ProductActions } from '@/components/product-actions';

export const dynamic = 'force-dynamic';
const money = (n: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(n);
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; const product = getProduct(id); return { title: product?.name || 'Producto no encontrado' }; }

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const product = getProduct(id);
  if (!product) return <div className="container empty-state page-empty"><span>⌕</span><h1>No encontramos esta ficha</h1><p>Puede que el enlace haya cambiado.</p><Link className="button" href="/tienda">Volver al catálogo</Link></div>;
  return <div className="container product-detail"><nav className="breadcrumbs"><Link href="/tienda">Tienda</Link><span>/</span><span>{product.family}</span></nav><div className="detail-grid"><div className="detail-art" style={{ background: product.visual }} aria-label={`Ilustración demo de ${product.name}`} role="img"><span>{product.icon}</span><small>ILUSTRACIÓN ORIGINAL · NO ES UNA FOTO DE PRODUCTO</small></div><div className="detail-copy"><span className="eyebrow">{product.category} / {product.family}</span><h1>{product.name}</h1><div className="synthetic-label">DATOS SINTÉTICOS DEL PROTOTIPO</div><strong className="detail-price">{money(product.priceCrc)}</strong><p>{product.summary}</p><p className="stock-note">{product.stock} unidades de demostración · No representa inventario comercial</p><div className="detail-attributes"><div><b>Estilos</b><span>{product.style.join(' · ')}</span></div><div><b>Compatible con</b><span>{product.compatible.join(' · ')}</span></div><div><b>{product.variantLabel || 'Variante'}</b><span>{product.variants.join(' · ')}</span></div><div><b>Origen del dato</b><span>Ficha ficticia creada para la demostración</span></div><div><b>Modelo 3D</b><span>Procedural ilustrativo {product.modelRef} · no es reproducción exacta</span></div></div><Link className="button" href={`/estudio?product=${product.id}`}>Probar en Estudio 3D</Link><ProductActions product={product}/><Link className="text-button" href={`/tienda?compare=${product.id}`}>Volver al catálogo para comparar →</Link><p className="micro-copy">La comparación de productos se realiza desde el catálogo; no se procesa una compra.</p></div></div><div className="detail-back"><Link className="text-button" href="/tienda">← Volver a todos los productos</Link></div></div>;
}
