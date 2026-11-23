'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Result = { error?: string; status?: string; type?: string; totalCrc?: number; fulfillment?: string; lines?: { product_name:string; variant?:string; quantity:number; unit_price_crc:number }[]; events?: { from_status?:string; to_status:string; created_at:string }[] };
const money = (n: number) => new Intl.NumberFormat('es-CR', { style:'currency',currency:'CRC',maximumFractionDigits:0 }).format(n);

export function TrackingPage() {
  const search = useSearchParams(); const [kind,setKind]=useState<'pedido'|'servicio'>('pedido'); const [code,setCode]=useState(''); const [result,setResult]=useState<Result|null>(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  useEffect(()=>{const initial=search.get('code'); if(initial) setCode(initial);},[search]);
  async function lookup(event:React.FormEvent) { event.preventDefault(); setBusy(true);setError('');setResult(null);try{const r=await fetch(`/api/${kind==='pedido'?'orders':'services'}/lookup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trackingCode:code.trim()})});const body=await r.json();if(!r.ok)throw new Error(body.error);setResult(body);}catch(e){setError(e instanceof Error?e.message:'No se pudo consultar.');}finally{setBusy(false);}}
  return <div className="container tracking-layout"><section className="tracking-form"><span className="eyebrow">ESTADO DE UNA DEMOSTRACIÓN</span><h2>¿Dónde va tu solicitud?</h2><p>Ingresá el código privado que se mostró al registrar un pedido o servicio demo.</p><form onSubmit={lookup}><label htmlFor="tracking-kind">Tipo de seguimiento</label><select id="tracking-kind" value={kind} onChange={(e)=>{setKind(e.target.value as 'pedido'|'servicio');setResult(null);}}><option value="pedido">Pedido demo</option><option value="servicio">Servicio demo</option></select><label htmlFor="tracking-code">Código privado</label><input id="tracking-code" autoComplete="off" required value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Pegá tu código aquí"/><button className="button" disabled={busy}>{busy?'Consultando…':'Consultar estado'}</button></form>{error&&<div className="notice notice-error" role="alert">{error}</div>}</section>
    {result&&<section className="tracking-result" aria-live="polite"><span className="eyebrow">{kind==='pedido'?'PEDIDO':'SERVICIO'} DE DEMOSTRACIÓN</span><div className="status-heading"><h2>{result.status}</h2><span className="status-pill">Estado actual</span></div>{result.type&&<p>Tipo de servicio: <strong>{result.type}</strong></p>}{result.fulfillment&&<p>Condición: {result.fulfillment} · solo ilustrativa</p>}
      {result.lines&&<div className="tracked-lines">{result.lines.map((line,i)=><div className="summary-row" key={i}><span>{line.quantity} × {line.product_name}{line.variant?` (${line.variant})`:''}</span><strong>{money(line.quantity*line.unit_price_crc)}</strong></div>)}<div className="summary-total"><span>Total demo</span><strong>{money(result.totalCrc||0)}</strong></div></div>}
      <h3>Actividad</h3><ol className="event-list">{result.events?.map((event,i)=><li key={i}><span className="event-dot"/><div><b>{event.to_status}</b><time>{new Date(event.created_at).toLocaleString('es-CR')}</time></div></li>)}</ol>
    </section>}
  </div>;
}
