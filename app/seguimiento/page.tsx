import { Suspense } from 'react';
import { TrackingPage } from '@/components/tracking-page';
export default function TrackingRoute(){return <><div className="page-masthead"><div className="container"><span className="eyebrow">SEGUIMIENTO PRIVADO</span><h1>Consultá el estado.</h1><p>Pedidos y servicios creados en este prototipo.</p></div></div><Suspense fallback={<div className="container notice">Cargando consulta…</div>}><TrackingPage /></Suspense></>;}
