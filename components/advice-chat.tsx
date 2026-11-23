'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { USE_OPTIONS, type AdviceResult, type Recommendation } from '@/lib/advisor';

type Preferences = { budgetCrc: string; family: string; style: string; use: string };
type Turn = { role: 'user' | 'assistant'; text: string; mode?: 'gemini' | 'local'; recommendations?: Recommendation[] };
type Stored = { preferences: Preferences; turns: Turn[] };
type Props = { families: string[]; styles: string[] };
const storageKey = 'digari-advice-chat-v1';
const welcome: Turn = { role: 'assistant', text: 'Te ayudo a filtrar el catÃ¡logo demo. Â¿QuÃ© presupuesto, tipo de equipo y uso o estilo tienes en mente?', mode: 'local' };

export default function AdviceChat({ families, styles }: Props) {
  const [preferences, setPreferences] = useState<Preferences>({ budgetCrc: '', family: '', style: '', use: '' });
  const [turns, setTurns] = useState<Turn[]>([welcome]); const [composer, setComposer] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) { const saved = JSON.parse(raw) as Stored; if (saved.preferences && Array.isArray(saved.turns)) { setPreferences(saved.preferences); setTurns(saved.turns.slice(-24)); } }
    } catch { localStorage.removeItem(storageKey); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(storageKey, JSON.stringify({ preferences, turns: turns.slice(-24) } satisfies Stored)); }, [preferences, turns, ready]);
  const change = (key: keyof Preferences, value: string) => setPreferences((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setError('');
    const question = composer.trim();
    const userText = question || `Busco ${preferences.family || 'un producto'} para ${USE_OPTIONS.find((option) => option.id === preferences.use)?.label.toLocaleLowerCase('es') || 'un uso por definir'}${preferences.budgetCrc ? ` con â‚¡${Number(preferences.budgetCrc).toLocaleString('es-CR')}` : ''}.`;
    const userTurn: Turn = { role: 'user', text: userText };
    setTurns((current) => [...current, userTurn].slice(-24)); setComposer(''); setBusy(true);
    try {
      const response = await fetch('/api/advice', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ budgetCrc: preferences.budgetCrc ? Number(preferences.budgetCrc) : undefined, family: preferences.family || undefined, style: preferences.style || undefined, use: preferences.use || undefined, question }) });
      const data = await response.json() as AdviceResult | { error: string };
      if (!response.ok || !('mode' in data)) throw new Error('error' in data ? data.error : 'No se pudo obtener una respuesta.');
      const answer = data.question ?? data.message;
      const reply: Turn = { role: 'assistant', text: answer, mode: data.mode, recommendations: data.recommendations };
      setTurns((current) => [...current, reply].slice(-24));
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'La asesorÃ­a no respondiÃ³.'); setTurns((current) => [...current, { role: 'assistant' as const, text: 'No pude consultar el servicio en este momento. Tus preferencias y el chat siguen guardados en este navegador.' }].slice(-24)); }
    finally { setBusy(false); }
  }
  function clearConversation() { const initial: Preferences = { budgetCrc: '', family: '', style: '', use: '' }; setPreferences(initial); setTurns([welcome]); setComposer(''); setError(''); localStorage.removeItem(storageKey); }

  return <div className="container advice-page">
    <div className="eyebrow">DIGARI STUDIO / ASESORÃA DEMO</div><h1>Encuentra una opciÃ³n que encaje.</h1>
    <p className="advice-lede">Indica presupuesto, tipo y uso para comparar hasta tres fichas sintÃ©ticas. Gemini es opcional; el filtro local funciona sin clave ni conexiÃ³n.</p>
    <div className="advice-layout">
      <section className="advice-panel" aria-label="ConversaciÃ³n de asesorÃ­a">
        <div className="advice-panel-heading"><div><span className="eyebrow">ASESORÃA MUSICAL</span><h2>Â¿QuÃ© estÃ¡s buscando?</h2></div><button className="button button-outline button-small" type="button" onClick={clearConversation}>Borrar chat local</button></div>
        <div className="chat-log" aria-live="polite" aria-relevant="additions text">{turns.map((turn, index) => <article className={`chat-bubble ${turn.role === 'user' ? 'chat-user' : 'chat-assistant'}`} key={`${index}-${turn.role}`}><div className="chat-meta"><strong>{turn.role === 'user' ? 'TÃº' : 'Digari Studio'}</strong>{turn.role === 'assistant' && turn.mode && <span>{turn.mode === 'gemini' ? 'Gemini Â· online' : 'Asesor local Â· offline/demo'}</span>}</div><p>{turn.text}</p>{turn.recommendations?.length ? <div className="advice-recommendations">{turn.recommendations.map((item) => <article className="advice-recommendation" key={item.productId}><span className="product-meta">{item.family} Â· ficha demo</span><h3><Link href={item.href}>{item.name}</Link></h3><strong>â‚¡{item.priceCrc.toLocaleString('es-CR')}</strong><p>{item.reason}</p><p className="micro-copy">Estilos: {item.style.join(' Â· ') || 'No indicado'}<br/>Compatible con: {item.compatible.join(' Â· ') || 'Sin compatibilidad indicada'}<br/>Existencia demo: {item.stockDemo}; no es inventario de Digari.</p><Link className="text-button" href={item.compareHref}>Comparar en la tienda â†’</Link></article>)}</div> : null}</article>)}</div>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <form className="advice-form" onSubmit={submit}>
          <div className="advice-fields"><label>Presupuesto mÃ¡ximo (CRC)<input type="number" min="1" max="10000000" step="1000" inputMode="numeric" placeholder="Ej. 80000" value={preferences.budgetCrc} onChange={(event) => change('budgetCrc', event.target.value)} /></label><label>Tipo de producto<select value={preferences.family} onChange={(event) => change('family', event.target.value)}><option value="">Elige un tipo</option>{families.map((family) => <option key={family} value={family}>{family}</option>)}</select></label><label>Uso principal<select value={preferences.use} onChange={(event) => change('use', event.target.value)}><option value="">Elige un uso</option>{USE_OPTIONS.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label><label>Estilo (opcional)<select value={preferences.style} onChange={(event) => change('style', event.target.value)}><option value="">Cualquier estilo</option>{styles.map((style) => <option value={style} key={style}>{style}</option>)}</select></label></div>
          <label className="chat-composer-label" htmlFor="advice-message">Tu mensaje <span className="micro-copy">mÃ¡ximo 240 caracteres</span></label><textarea id="advice-message" maxLength={240} rows={3} value={composer} onChange={(event) => setComposer(event.target.value)} placeholder="Ej. Â¿CuÃ¡l de estas opciones me servirÃ­a para empezar?" />
          <div className="advice-form-footer"><small>El chat se conserva solo en este navegador. Gemini recibe solo tus selecciones y candidatos del catÃ¡logo; no recibe este mensaje ni el historial. No escribas datos personales.</small><button className="button" type="submit" disabled={busy}>{busy ? 'Buscandoâ€¦' : 'Pedir recomendaciÃ³n'}</button></div>
        </form>
      </section>
      <aside className="advice-side"><span className="eyebrow">CÃ“MO FUNCIONA</span><h2>Tus criterios primero.</h2><ol><li>El servidor filtra presupuesto, tipo, stock demo, compatibilidad y estilo.</li><li>Gemini solo puede explicar hasta tres candidatos ya filtrados; el servidor verifica sus IDs.</li><li>Sin clave, ante error o al quedar sin conexiÃ³n, responde el mismo filtro local.</li></ol><div className="notice"><strong>Datos demostrativos.</strong><p>Precios, existencias, compatibilidades y fichas son sintÃ©ticos. El recomendador no decide pedidos, pagos ni estados.</p></div><Link className="text-button" href="/tienda">Abrir el catÃ¡logo completo â†’</Link></aside>
    </div>
  </div>;
}
