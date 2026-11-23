import { CatalogBrowser } from '@/components/catalog-browser';
export default function FavoritesPage() { return <><div className="page-masthead"><div className="container"><span className="eyebrow">GUARDADOS EN ESTE DISPOSITIVO</span><h1>Favoritos</h1><p>Tu lista permanece en este navegador; no requiere una cuenta.</p></div></div><CatalogBrowser favoritesOnly /></>; }
