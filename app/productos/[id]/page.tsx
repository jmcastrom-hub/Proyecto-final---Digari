import type { Metadata } from 'next';
import Link from 'next/link';
import { getProduct } from '@/lib/db';
import { ProductActions } from '@/components/product-actions';
import { ProductImage, hasProductPhoto } from '@/components/product-image';

export const dynamic = 'force-dynamic';
const money = (n: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(n);
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; const product = getProduct(id); return { title: product?.name || 'Producto no encontrado' }; }

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> }) {
  const { id } = await params; const product = getProduct(id);
  const source = (await searchParams).from;
  const returnPath = source?.startsWith('/tienda') && !source.startsWith('//') ? source : '/tienda';
  const compareUrl = new URL(returnPath, 'http://localhost');
  compareUrl.searchParams.set('compare', product?.id || id);
  const comparePath = compareUrl.pathname + compareUrl.search;
  if (!product) return <div className="container empty-state page-empty"><span>⌕</span><h1>No encontramos esta ficha</h1><p>Puede que el enlace haya cambiado.</p><Link className="button" href="/tienda">Volver al catálogo</Link></div>;
  return <div className="container product-detail"><nav className="breadcrumbs"><Link href="/tienda">Tienda</Link><span>/</span><span>{product.family}</span></nav><div className="detail-grid"><div className="detail-art"><ProductImage productId={product.id} productName={product.name} priority /><small>{hasProductPhoto(product.id) ? 'FOTOGRAFÍA DE REFERENCIA · DATOS Y EXISTENCIAS DEMO' : 'ILUSTRACIÓN DEMO · FOTOGRAFÍA PENDIENTE'}</small></div><div className="detail-copy"><span className="eyebrow">{product.category} / {product.family}</span><h1>{product.name}</h1><div className="synthetic-label">DATOS SINTÉTICOS DEL PROTOTIPO</div><strong className="detail-price">{money(product.priceCrc)}</strong><p>{product.summary}</p><p className="stock-note">{product.stock} unidades de demostración · No representa inventario comercial</p><div className="detail-attributes"><div><b>Estilos</b><span>{product.style.join(' · ')}</span></div><div><b>Compatible con</b><span>{product.compatible.join(' · ')}</span></div><div><b>{product.variantLabel || 'Variante'}</b><span>{product.variants.join(' · ')}</span></div><div><b>Origen del dato</b><span>Ficha ficticia creada para la demostración</span></div><div><b>Modelo 3D</b><span>Procedural ilustrativo {product.modelRef} · no es reproducción exacta</span></div></div><Link className="button" href={`/estudio?product=${product.id}`}>Probar en Estudio 3D</Link><ProductActions product={product}/><Link className="text-button" href={comparePath}>Volver al catálogo para comparar →</Link><p className="micro-copy">La comparación de productos se realiza desde el catálogo; no se procesa una compra.</p></div></div><div className="detail-back"><Link className="text-button" href={returnPath}>← Volver a todos los productos</Link></div></div>;
}
