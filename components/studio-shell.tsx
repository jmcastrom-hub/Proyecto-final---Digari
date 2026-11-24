'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { preloadStudioModel } from '@/lib/studio-preload';
import { productImageSource } from './product-image';

type Product = { id: string; name: string; family: string; category: string; priceCrc: number; stock: number; style: string[]; compatible: string[]; summary: string; visual: string; icon: string; modelRef: string; audioNotes?: { use: string; connections: string[]; distinction: string } };
const loadModelViewer = () => import('./model-viewer');
const loadAudioLab = () => import('./audio-lab');
const ModelViewer = dynamic(loadModelViewer, { ssr: false, loading: () => <div className="studio-loading" role="status">Preparando motor 3D cuando se activa…</div> });
const AudioLab = dynamic(loadAudioLab, { ssr: false, loading: () => <div className="studio-loading" role="status">Preparando audio cuando se activa…</div> });

function StudioContent() {
  const search = useSearchParams(); const [items, setItems] = useState<Product[]>([]); const [selected, setSelected] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [viewerOn, setViewerOn] = useState(false); const [audioOn, setAudioOn] = useState(false);
  useEffect(() => { let active = true; fetch('/api/products', { cache: 'no-store' }).then(async (response) => { if (!response.ok) throw new Error('No pudimos cargar el catálogo ahora.'); return response.json(); }).then((data: { items: Product[] }) => { if (!active) return; setItems(data.items); const requested = search.get('product'); setSelected(data.items.some((item) => item.id === requested) ? requested! : data.items[0]?.id ?? ''); }).catch(() => { if (active) setError('El catálogo no respondió. Reintenta o vuelve a la tienda.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [search]);
  const product = items.find((item) => item.id === selected);
  const preloadViewer = () => { void loadModelViewer(); void preloadStudioModel().catch(() => {}); };
  const preloadAudio = () => { void loadAudioLab(); };
  return <div className="container studio-page">
    <div className="eyebrow">DIGARI STUDIO / ESTUDIO DE PRUEBA</div><h1>Explora antes de decidir.</h1>
    <p className="studio-lede">Una maqueta 3D procedural y herramientas de escucha con tonos sintetizados. No son reproducciones exactas ni muestras grabadas de los productos de Digari.</p>
    <div className="studio-product-picker"><label htmlFor="studio-product">Producto del catálogo demo</label>{loading ? <p role="status">Cargando fichas…</p> : error ? <div className="notice notice-error" role="alert"><p>{error}</p><button className="button button-outline" onClick={() => window.location.reload()}>Reintentar</button></div> : <select id="studio-product" value={selected} onChange={(event) => { setSelected(event.target.value); setViewerOn(false); }} aria-describedby="model-origin">{items.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.family}</option>)}</select>}</div>
    {product && <section className="studio-product-summary"><div><span className="product-meta">{product.category} <span>·</span> {product.family}</span><h2>{product.name}</h2><p>{product.summary}</p><strong>₡{product.priceCrc.toLocaleString('es-CR')}</strong><p>Compatibilidad: {product.compatible.join(' · ')}</p>{product.audioNotes && <div className="audio-specs"><h3>Uso y conexiones · especificación sintética</h3><p><b>Uso:</b> {product.audioNotes.use}</p><p><b>Conexiones:</b> {product.audioNotes.connections.join(' · ')}</p><p><b>Diferencia:</b> {product.audioNotes.distinction}</p></div>}<p id="model-origin" className="micro-copy">Ficha, disponibilidad y especificaciones sintéticas para demostración académica.</p><Link className="button button-outline button-small" href={`/productos/${product.id}`}>Ver ficha del catálogo</Link></div><div className="studio-art" style={{ background: product.visual }} aria-hidden="true"><span>{product.icon}</span></div></section>}
      {product && <section className="studio-panel"><div className="studio-section-title"><div><span className="eyebrow">01 / VISTA 3D</span><h2>Estudio visual</h2></div><button className="button" type="button" onPointerEnter={preloadViewer} onFocus={preloadViewer} onClick={() => setViewerOn((value) => !value)}>{viewerOn ? 'Cerrar visor 3D' : 'Activar visor 3D'}</button></div><p>Los modelos se generan con geometría procedural en el navegador, sin texturas descargadas. La imagen del catálogo es la alternativa si WebGL no está disponible.</p>{viewerOn && <ModelViewer key={product.id} modelRef={product.modelRef} name={product.name} imageSrc={productImageSource(product.id)} />}</section>}
    <section className="studio-panel"><div className="studio-section-title"><div><span className="eyebrow">02 / ESCUCHA</span><h2>Laboratorio de audio</h2></div><button className="button" type="button" onPointerEnter={preloadAudio} onFocus={preloadAudio} onClick={() => setAudioOn((value) => !value)}>{audioOn ? 'Cerrar audio' : 'Activar audio'}</button></div><p>Audio Web generado en el dispositivo y reproducido solo con acción explícita. No usa muestras de instrumentos ni grabaciones de Digari.</p>{audioOn && <AudioLab modelRef={product?.modelRef} />}</section>
    <div className="notice"><strong>Prototipo local.</strong> No realiza compras ni reproduce perfiles acústicos de equipos reales. Para continuar con el flujo comercial demo, visita la <Link href="/tienda">tienda</Link>.</div>
  </div>;
}

export default function StudioShell() { return <Suspense fallback={<div className="container studio-page"><p role="status">Abriendo el estudio…</p></div>}><StudioContent /></Suspense>; }
