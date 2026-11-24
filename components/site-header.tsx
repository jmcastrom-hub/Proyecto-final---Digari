'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    const read = () => { try { const items = JSON.parse(localStorage.getItem('digari-cart') || '[]') as { quantity: number }[]; setCartCount(items.reduce((sum, item) => sum + item.quantity, 0)); } catch { setCartCount(0); } };
    read();
    window.addEventListener('storage', read);
    window.addEventListener('digari-cart-updated', read);
    return () => { window.removeEventListener('storage', read); window.removeEventListener('digari-cart-updated', read); };
  }, []);
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="Digari Studio, inicio"><span className="brand-mark">D<span>•</span></span><span>digari <b>studio</b><small>ASESORÍA MUSICAL</small></span></Link>
    <nav className="desktop-nav" aria-label="Navegación principal">
      <Link href="/">Inicio</Link><details className="nav-menu"><summary>Tienda</summary><div className="nav-popover"><Link href="/tienda">Todo el catálogo</Link>{['Instrumentos','Audio profesional','Home Studio','DJ','Accesorios'].map((x) => <Link key={x} href={`/tienda?category=${encodeURIComponent(x)}`}>{x}</Link>)}<Link href="/promos">Selección destacada demo</Link></div></details>
      <Link href="/asesoria">Asesoría</Link><Link href="/estudio">Estudio 3D</Link><Link href="/servicios">Servicios</Link><Link href="/seguimiento">Seguimiento</Link><Link href="/contacto">Contacto</Link><Link className="favorite-nav-link" href="/favoritos" aria-label="Favoritos"><span aria-hidden="true">♡</span><span>Favoritos</span></Link>
    </nav>
    <Link className="cart-link" href="/carrito" aria-label={`Carrito, ${cartCount} artículos`}>Bolsa <span>{cartCount}</span></Link>
    <details className="mobile-nav"><summary aria-label="Abrir navegación">☰</summary><nav aria-label="Navegación móvil"><Link href="/">Inicio</Link><Link href="/tienda">Tienda: todo el catálogo</Link>{['Instrumentos','Audio profesional','Home Studio','DJ','Accesorios'].map((x)=><Link key={x} href={`/tienda?category=${encodeURIComponent(x)}`}>{x}</Link>)}<Link href="/promos">Selección destacada demo</Link><Link href="/favoritos">Favoritos</Link><Link href="/asesoria">Asesoría</Link><Link href="/estudio">Estudio 3D</Link><Link href="/servicios">Servicios</Link><Link href="/seguimiento">Seguimiento</Link><Link href="/contacto">Contacto</Link><Link href="/carrito">Carrito ({cartCount})</Link></nav></details>
  </div></header>;
}
