'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/catalog';
import { ProductImage, hasProductPhoto } from '@/components/product-image';

type CatalogResponse = { items: Product[]; categories: string[]; families: string[]; styles: string[]; total: number };
type CartLine = { productId: string; variant?: string; quantity: number };
const money = (n: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(n);

export function CatalogBrowser({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [style, setStyle] = useState('');
  const [inStock, setInStock] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [compare, setCompare] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [retry, setRetry] = useState(0);
  const [addedId, setAddedId] = useState('');

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem('digari-favorites') || '[]'));
      setRatings(JSON.parse(localStorage.getItem('digari-ratings') || '{}'));
    } catch { setFavorites([]); setRatings({}); }
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('q') || '');
    setFamily(params.get('family') || '');
    setCategory(params.get('category') || '');
    setMaxPrice(params.get('maxPrice') || '');
    setMinPrice(params.get('minPrice') || '');
    setStyle(params.get('style') || '');
    setInStock(params.get('inStock') === 'true');
    if (params.get('compare')) setCompare(params.get('compare')!.split(',').slice(0, 3));
    setLoaded(true);
  }, []);
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get('q') || ''); setFamily(params.get('family') || '');
      setCategory(params.get('category') || ''); setMaxPrice(params.get('maxPrice') || '');
      setMinPrice(params.get('minPrice') || ''); setStyle(params.get('style') || '');
      setInStock(params.get('inStock') === 'true');
      setCompare(params.get('compare')?.split(',').slice(0, 3) || []);
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (family) params.set('family', family);
    if (category) params.set('category', category);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minPrice) params.set('minPrice', minPrice);
    if (style) params.set('style', style);
    if (inStock) params.set('inStock', 'true');
    if (!loaded) return;
    if (!favoritesOnly) window.history.replaceState(window.history.state, '', `/tienda${params.size ? `?${params}` : ''}`);
    setError('');
    fetch(`/api/products?${params}`, { cache: 'no-store' }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'No se pudo cargar el catálogo.');
      setData(body);
    }).catch((reason: Error) => setError(reason.message));
  }, [query, family, category, minPrice, maxPrice, style, inStock, retry, loaded, favoritesOnly]);

  const shown = useMemo(() => (data?.items || []).filter((p) => !favoritesOnly || favorites.includes(p.id)), [data, favorites, favoritesOnly]);
  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(next); localStorage.setItem('digari-favorites', JSON.stringify(next));
  }
  function rate(id: string, score: number) {
    const next = { ...ratings, [id]: score }; setRatings(next); localStorage.setItem('digari-ratings', JSON.stringify(next));
  }
  function toggleCompare(id: string) {
    if (compare.includes(id)) setCompare(compare.filter((x) => x !== id));
    else if (compare.length < 3) setCompare([...compare, id]);
  }
  function addToCart(product: Product) {
    const variant = product.variants[0];
    const cart: CartLine[] = JSON.parse(localStorage.getItem('digari-cart') || '[]');
    const found = cart.find((line) => line.productId === product.id && line.variant === variant);
    if (found) found.quantity += 1; else cart.push({ productId: product.id, variant, quantity: 1 });
    localStorage.setItem('digari-cart', JSON.stringify(cart)); window.dispatchEvent(new Event('digari-cart-updated'));
    setAddedId(product.id);
  }
  const compared = shown.filter((p) => compare.includes(p.id));
  const filters = new URLSearchParams();
  if (query.trim()) filters.set('q', query.trim());
  if (family) filters.set('family', family);
  if (category) filters.set('category', category);
  if (maxPrice) filters.set('maxPrice', maxPrice);
  if (minPrice) filters.set('minPrice', minPrice);
  if (style) filters.set('style', style);
  if (inStock) filters.set('inStock', 'true');
  const detailHref = (id: string) => {
    const state = new URLSearchParams(filters);
    if (compare.length) state.set('compare', compare.join(','));
    return `/productos/${id}?from=${encodeURIComponent(`/tienda${state.size ? `?${state}` : ''}`)}`;
  };

  return <div className="container catalog-layout">
    <aside className="filters-panel"><div className="eyebrow">ENCONTRÁ TU EQUIPO</div><h2>Filtros</h2>
      <label htmlFor="search-products">Buscar</label><input id="search-products" type="search" placeholder="Guitarra, estudio…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <label htmlFor="filter-family">Familia</label><select id="filter-family" value={family} onChange={(e) => setFamily(e.target.value)}><option value="">Todas las familias</option>{data?.families.map((x) => <option key={x}>{x}</option>)}</select>
      <label htmlFor="filter-category">Categoría</label><select id="filter-category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Todas las categorías</option>{data?.categories.map((x) => <option key={x}>{x}</option>)}</select>
      <label htmlFor="filter-style">Estilo / uso</label><select id="filter-style" value={style} onChange={(e) => setStyle(e.target.value)}><option value="">Todos los estilos</option>{data?.styles.map((x) => <option key={x}>{x}</option>)}</select>
      <label htmlFor="filter-min-price">Precio mínimo (CRC)</label><input id="filter-min-price" inputMode="numeric" type="number" min="0" step="1000" placeholder="₡0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
      <label htmlFor="filter-price">Presupuesto máximo (CRC)</label><input id="filter-price" inputMode="numeric" type="number" min="0" step="1000" placeholder="Sin límite" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      <label className="check-line"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> Con existencias demo</label>
      <button className="button button-quiet full-width" onClick={() => { setQuery(''); setFamily(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setStyle(''); setInStock(false); }}>Limpiar filtros</button>
      <p className="micro-copy">Precios, compatibilidad y existencias son datos sintéticos guardados localmente.</p>
    </aside>
    <section className="catalog-results" aria-live="polite">
      <div className="result-heading"><div><span className="eyebrow">CATÁLOGO DE DEMOSTRACIÓN</span><h1>{favoritesOnly ? 'Tus favoritos' : category || 'Explorá el catálogo'}</h1></div><span className="result-count">{shown.length} productos</span></div>
      {!loaded && <div className="notice">Cargando tus preferencias…</div>}
      {error && <div className="notice notice-error" role="alert"><strong>No pudimos cargar el catálogo.</strong><p>{error}</p><button className="button button-small" onClick={() => setRetry((x) => x + 1)}>Intentar de nuevo</button></div>}
      {favoritesOnly && favorites.length === 0 && <div className="empty-state"><span>♡</span><h2>Aún no guardás favoritos</h2><p>Explorá el catálogo y guardá las opciones que querés comparar.</p><Link className="button" href="/tienda">Ir a la tienda</Link></div>}
      {loaded && !error && shown.length === 0 && (!favoritesOnly || favorites.length > 0) && <div className="empty-state"><span>⌕</span><h2>No encontramos opciones</h2><p>Probá otro presupuesto, búsqueda o categoría.</p><button className="button" onClick={() => { setQuery(''); setFamily(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setStyle(''); setInStock(false); }}>Limpiar filtros</button></div>}
      <div className="product-grid">{shown.map((p) => <article className="product-card" key={p.id}>
        <div className="product-art"><ProductImage productId={p.id} productName={p.name} /><small>{hasProductPhoto(p.id) ? 'FOTOGRAFÍA DE REFERENCIA · DATOS DEMO' : 'ILUSTRACIÓN DEMO · FOTO PENDIENTE'}</small><button className={`favorite-button ${favorites.includes(p.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(p.id)} aria-label={favorites.includes(p.id) ? `Quitar ${p.name} de favoritos` : `Guardar ${p.name} en favoritos`}>{favorites.includes(p.id) ? '♥' : '♡'}</button></div>
        <div className="product-info"><div className="product-meta">{p.category} <span>·</span> {p.family}</div><h2><Link href={detailHref(p.id)}>{p.name}</Link></h2><p>{p.summary}</p><strong className="product-price">{money(p.priceCrc)}</strong><div className="product-stock">{p.stock > 0 ? `${p.stock} unidades demo` : 'Sin existencias demo'}</div>
          <div className="rating-row" aria-label="Valoración personal"><span>Tu valoración</span><div>{[1,2,3,4,5].map((star) => <button key={star} className={star <= (ratings[p.id] || 0) ? 'star active' : 'star'} onClick={() => rate(p.id, star)} aria-label={`${star} de 5`}>★</button>)}</div></div>
          <div className="card-actions"><button className="button button-small" onClick={() => addToCart(p)} disabled={p.stock < 1}>{addedId===p.id?'Agregado ✓':'Agregar al carrito demo'}</button><label className="compare-toggle"><input type="checkbox" checked={compare.includes(p.id)} onChange={() => toggleCompare(p.id)} disabled={!compare.includes(p.id) && compare.length >= 3} /> Comparar</label></div>
        </div>
      </article>)}</div>
      {compare.length > 0 && <section className="compare-panel" aria-labelledby="compare-title"><div className="section-heading"><div><span className="eyebrow">DECIDÍ CON CALMA</span><h2 id="compare-title">Comparación lado a lado <small>({compared.length}/3)</small></h2></div><button className="text-button" onClick={() => setCompare([])}>Limpiar</button></div>
        <div className="compare-grid" role="table" aria-label="Comparación de productos">{compared.map((p) => <div className="compare-item" role="row" key={p.id}><ProductImage productId={p.id} productName={p.name} /><span className="product-meta">{p.family}</span><h3><Link href={detailHref(p.id)}>{p.name}</Link></h3><strong>{money(p.priceCrc)}</strong><p>Existencias demo: {p.stock}</p><p>Estilo: {p.style.join(', ')}</p><p>Compatible con: {p.compatible.join(', ')}</p><button className="text-button" onClick={() => toggleCompare(p.id)}>Quitar</button></div>)}</div>
      </section>}
    </section>
  </div>;
}
