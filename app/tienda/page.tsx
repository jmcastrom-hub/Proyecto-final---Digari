import type { Metadata } from 'next';
import { CatalogBrowser } from '@/components/catalog-browser';
export const metadata: Metadata = { title: 'Tienda' };
export default function StorePage() { return <><div className="page-masthead"><div className="container"><span className="eyebrow">CATÁLOGO SINTÉTICO</span><h1>Encontrá lo que suena a vos.</h1><p>15 opciones demo con compatibilidad, estilo y presupuesto visibles.</p></div></div><CatalogBrowser /></>; }
