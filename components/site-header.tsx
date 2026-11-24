'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const categories = ['Instrumentos', 'Audio profesional', 'Home Studio', 'DJ', 'Accesorios'];

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [desktopStoreOpen, setDesktopStoreOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopStoreRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const desktopStoreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const read = () => {
      try {
        const items = JSON.parse(localStorage.getItem('digari-cart') || '[]') as { quantity: number }[];
        setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
      } catch { setCartCount(0); }
    };
    read();
    window.addEventListener('storage', read);
    window.addEventListener('digari-cart-updated', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('digari-cart-updated', read);
    };
  }, []);

  useEffect(() => {
    const closeAll = () => {
      setMobileOpen(false);
      setMobileCategoriesOpen(false);
      setDesktopStoreOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !mobileMenuRef.current?.contains(target)) {
        setMobileOpen(false);
        setMobileCategoriesOpen(false);
      }
      if (target instanceof Node && !desktopStoreRef.current?.contains(target)) setDesktopStoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const mobileWasOpen = mobileOpen;
      const desktopStoreWasOpen = desktopStoreOpen;
      closeAll();
      if (mobileWasOpen) mobileButtonRef.current?.focus();
      else if (desktopStoreWasOpen) desktopStoreButtonRef.current?.focus();
    };
    const desktopMode = window.matchMedia('(min-width: 1241px)');
    const onBreakpoint = () => closeAll();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    desktopMode.addEventListener('change', onBreakpoint);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      desktopMode.removeEventListener('change', onBreakpoint);
    };
  }, [mobileOpen, desktopStoreOpen]);

  const closeMenus = () => {
    setMobileOpen(false);
    setMobileCategoriesOpen(false);
    setDesktopStoreOpen(false);
  };
  const categoryLinks = (className = '') => categories.map((category) => (
    <Link className={className} key={category} href={`/tienda?category=${encodeURIComponent(category)}`} onClick={closeMenus}>{category}</Link>
  ));

  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="Digari Studio, inicio" onClick={closeMenus}><span className="brand-mark">D<span>•</span></span><span>digari <b>studio</b><small>ASESORÍA MUSICAL</small></span></Link>
    <nav className="desktop-nav" aria-label="Navegación principal">
      <Link href="/" onClick={closeMenus}>Inicio</Link>
      <div className="nav-menu" ref={desktopStoreRef}>
        <button ref={desktopStoreButtonRef} className="nav-menu-trigger" type="button" aria-expanded={desktopStoreOpen} aria-controls="desktop-store-menu" onClick={() => setDesktopStoreOpen((open) => !open)}>Tienda</button>
        {desktopStoreOpen && <div className="nav-popover" id="desktop-store-menu">
          <Link href="/tienda" onClick={closeMenus}>Todo el catálogo</Link>{categoryLinks()}
          <Link href="/promos" onClick={closeMenus}>Selección destacada demo</Link>
        </div>}
      </div>
      <Link href="/asesoria" onClick={closeMenus}>Asesoría</Link><Link href="/estudio" onClick={closeMenus}>Estudio 3D</Link><Link href="/servicios" onClick={closeMenus}>Servicios</Link><Link href="/seguimiento" onClick={closeMenus}>Seguimiento</Link><Link href="/contacto" onClick={closeMenus}>Contacto</Link>
      <Link className="favorite-nav-link" href="/favoritos" aria-label="Favoritos" onClick={closeMenus}><span aria-hidden="true">♡</span><span>Favoritos</span></Link>
    </nav>
    <Link className="cart-link" href="/carrito" aria-label={`Carrito, ${cartCount} artículos`} onClick={closeMenus}>Bolsa <span>{cartCount}</span></Link>
    <div className="mobile-nav" ref={mobileMenuRef}>
      <button ref={mobileButtonRef} className="mobile-menu-trigger" type="button" aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => { setMobileOpen((open) => !open); setMobileCategoriesOpen(false); }}>
        {mobileOpen ? <span>Cerrar menú</span> : <span aria-hidden="true">☰</span>}
      </button>
      {mobileOpen && <nav className="mobile-nav-panel" id="mobile-navigation" aria-label="Navegación móvil">
        <Link href="/" onClick={closeMenus}>Inicio</Link>
        <Link href="/tienda" onClick={closeMenus}>Tienda: todo el catálogo</Link>
        <div className="mobile-store-categories">
          <button className="mobile-categories-trigger" type="button" aria-expanded={mobileCategoriesOpen} aria-controls="mobile-store-categories" onClick={() => setMobileCategoriesOpen((open) => !open)}>Categorías <span aria-hidden="true">{mobileCategoriesOpen ? '−' : '+'}</span></button>
          {mobileCategoriesOpen && <div className="mobile-category-links" id="mobile-store-categories">{categoryLinks()}</div>}
        </div>
        <Link href="/promos" onClick={closeMenus}>Selección destacada demo</Link>
        <Link href="/favoritos" onClick={closeMenus}>Favoritos</Link>
        <Link href="/asesoria" onClick={closeMenus}>Asesoría</Link>
        <Link href="/estudio" onClick={closeMenus}>Estudio 3D</Link>
        <Link href="/servicios" onClick={closeMenus}>Servicios</Link>
        <Link href="/seguimiento" onClick={closeMenus}>Seguimiento</Link>
        <Link href="/contacto" onClick={closeMenus}>Contacto</Link>
        <Link href="/carrito" onClick={closeMenus}>Carrito ({cartCount})</Link>
      </nav>}
    </div>
  </div></header>;
}
