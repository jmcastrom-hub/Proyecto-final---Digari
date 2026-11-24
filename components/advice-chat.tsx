'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { parseBudgetCrc, USE_OPTIONS, type AdviceResult, type Recommendation } from '@/lib/advisor';
import { repairLegacyUtf8 } from '@/lib/text-encoding';
import { ProductImage } from '@/components/product-image';

type Preferences = { budgetCrc: string; family: string; style: string; use: string };
type Turn = { role: 'user' | 'assistant'; text: string; mode?: 'gemini' | 'local'; recommendations?: Recommendation[] };
type Stored = { preferences: Preferences; turns: Turn[] };
type Props = { families: string[]; styles: string[] };
const storageKey = 'digari-advice-chat-v1';
const initialPreferences: Preferences = { budgetCrc: '', family: '', style: '', use: '' };
const welcome: Turn = { role: 'assistant', text: 'Te ayudo a encontrar equipo del catálogo demo. ¿Qué presupuesto, tipo y uso o estilo tenés en mente?', mode: 'local' };

function repairTurn(turn: Turn): Turn {
  return {
    ...turn,
    text: repairLegacyUtf8(turn.text),
    recommendations: turn.recommendations?.map((item) => ({
      ...item,
      name: repairLegacyUtf8(item.name),
      family: repairLegacyUtf8(item.family),
      reason: repairLegacyUtf8(item.reason),
      style: item.style.map(repairLegacyUtf8),
      compatible: item.compatible.map(repairLegacyUtf8),
    })),
  };
}

function friendlyBudgetError(value: string): string {
  if (!value.trim()) return '';
  try { parseBudgetCrc(value); return ''; }
  catch { return 'Ingresá un monto entero entre ₡0 y ₡10 000 000.'; }
}

export default function AdviceChat({ families, styles }: Props) {
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [turns, setTurns] = useState<Turn[]>([welcome]);
  const [composer, setComposer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const budgetError = friendlyBudgetError(preferences.budgetCrc);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Stored;
        if (saved.preferences && Array.isArray(saved.turns)) {
          setPreferences({
            budgetCrc: repairLegacyUtf8(String(saved.preferences.budgetCrc ?? '')),
            family: repairLegacyUtf8(String(saved.preferences.family ?? '')),
            style: repairLegacyUtf8(String(saved.preferences.style ?? '')),
            use: repairLegacyUtf8(String(saved.preferences.use ?? '')),
          });
          setTurns(saved.turns.slice(-24).filter((turn) => turn && (turn.role === 'assistant' || turn.role === 'user') && typeof turn.text === 'string').map(repairTurn));
        }
      }
    } catch { localStorage.removeItem(storageKey); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify({ preferences, turns: turns.slice(-24) } satisfies Stored));
  }, [preferences, turns, ready]);

  const change = (key: keyof Preferences, value: string) => setPreferences((current) => ({ ...current, [key]: value }));

  function applyExample(example: { budget: string; family: string; use: string; style: string; question: string }) {
    setPreferences({ budgetCrc: example.budget, family: example.family, use: example.use, style: example.style });
    setComposer(example.question);
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');

    let budgetCrc: number | undefined;
    try { budgetCrc = parseBudgetCrc(preferences.budgetCrc); }
    catch { setError('Revisá el presupuesto: debe ser un monto entero entre ₡0 y ₡10 000 000.'); return; }

    const question = composer.trim();
    const useLabel = USE_OPTIONS.find((option) => option.id === preferences.use)?.label.toLocaleLowerCase('es');
    const userText = question || `Busco ${preferences.family || 'un producto'}${useLabel ? ` para ${useLabel}` : ''}${budgetCrc !== undefined ? ` con un máximo de ₡${budgetCrc.toLocaleString('es-CR')}` : ''}.`;
    setTurns((current) => [...current, { role: 'user' as const, text: userText }].slice(-24));
    setComposer('');
    setBusy(true);
    try {
      const response = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ budgetCrc, family: preferences.family || undefined, style: preferences.style || undefined, use: preferences.use || undefined, question }),
      });
      const data = await response.json() as AdviceResult | { error?: string };
      if (!response.ok || !('mode' in data)) {
        setError(response.status === 429
          ? 'El asesor necesita un respiro. Probá de nuevo dentro de un minuto.'
          : 'No pudimos completar la consulta. Revisá los criterios e intentá otra vez.');
        setTurns((current) => [...current, { role: 'assistant' as const, text: 'No pude completar esta consulta ahora. Tus criterios siguen acá para que podás ajustarlos y probar de nuevo.' }].slice(-24));
        return;
      }
      const answer = [data.message, data.question].filter(Boolean).join(' ');
      setTurns((current) => [...current, { role: 'assistant' as const, text: answer, mode: data.mode, recommendations: data.recommendations }].slice(-24));
    } catch {
      setError('No pudimos conectar con la asesoría. Tus criterios siguen en esta página; podés volver a intentar.');
      setTurns((current) => [...current, { role: 'assistant' as const, text: 'La conexión no está disponible. Cuando querás, probá de nuevo; no se perdió lo que escribiste en los filtros.' }].slice(-24));
    } finally { setBusy(false); }
  }

  function clearConversation() {
    setPreferences(initialPreferences);
    setTurns([welcome]);
    setComposer('');
    setError('');
    localStorage.removeItem(storageKey);
  }

  return <div className="container advice-page">
    <div className="advice-intro">
      <span className="eyebrow">DIGARI STUDIO / ASESORÍA DEMO</span>
      <h1>Encontrá una opción que encaje.</h1>
      <p className="advice-lede">Decinos cuánto querés invertir, qué equipo buscás y para qué lo vas a usar. Te mostramos hasta tres fichas sintéticas.</p>
    </div>
    <div className="advice-layout">
      <section className="advice-panel" aria-label="Criterios para pedir una recomendación">
        <div className="advice-panel-heading"><div><span className="eyebrow">TU CONSULTA</span><h2>¿Qué equipo estás buscando?</h2></div><button className="button button-outline button-small" type="button" onClick={clearConversation}>Borrar chat local</button></div>
        <form className="advice-form" onSubmit={submit}>
          <label className="chat-composer-label" htmlFor="advice-message">Tu consulta <span className="micro-copy">máximo 240 caracteres</span></label>
          <textarea id="advice-message" maxLength={240} rows={2} value={composer} onChange={(event) => setComposer(event.target.value)} placeholder="Ej.: Quiero una guitarra para empezar a practicar en casa." />
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <div className="advice-form-footer"><small>Asesoría demo: no usamos datos personales ni procesamos pedidos. La respuesta local sigue disponible si Gemini no responde.</small><button className="button" type="submit" disabled={busy || Boolean(budgetError)}>{busy ? 'Buscando…' : 'Enviar consulta'}</button></div>

          <div className="advice-fields">
            <label htmlFor="advice-budget">Presupuesto máximo (CRC)<input id="advice-budget" type="text" inputMode="numeric" autoComplete="off" maxLength={16} placeholder="Ej. 80 000" aria-invalid={Boolean(budgetError)} aria-describedby="advice-budget-help advice-budget-error" value={preferences.budgetCrc} onChange={(event) => change('budgetCrc', event.target.value)} /></label>
            <label htmlFor="advice-family">Tipo de producto<select id="advice-family" value={preferences.family} onChange={(event) => change('family', event.target.value)}><option value="">Elegí un tipo</option>{families.map((family) => <option key={family} value={family}>{family}</option>)}</select></label>
            <label htmlFor="advice-use">Uso principal<select id="advice-use" value={preferences.use} onChange={(event) => change('use', event.target.value)}><option value="">Elegí un uso</option>{USE_OPTIONS.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label>
            <label htmlFor="advice-style">Estilo (opcional)<select id="advice-style" value={preferences.style} onChange={(event) => change('style', event.target.value)}><option value="">Cualquier estilo</option>{styles.map((style) => <option value={style} key={style}>{style}</option>)}</select></label>
          </div>
          <small id="advice-budget-help" className="micro-copy">Podés usar espacios, puntos o comas para separar miles. ₡0 es válido; vacío significa que aún falta definir el monto.</small>
          {budgetError && <small id="advice-budget-error" className="field-error" role="alert">{budgetError}</small>}
        </form>
      </section>
      <aside className="advice-side"><span className="eyebrow">IDEAS PARA EMPEZAR</span><h2>Probá con un ejemplo.</h2>
        <div className="advice-examples">
          <button type="button" className="example-chip" onClick={() => applyExample({ budget: '80 000', family: 'Guitarra acústica', use: 'iniciacion', style: 'folk', question: 'Busco algo sencillo para empezar a practicar en casa.' })}><strong>Guitarra acústica</strong><span>Hasta ₡80 000 · empezar</span></button>
          <button type="button" className="example-chip" onClick={() => applyExample({ budget: '250 000', family: 'Interfaz', use: 'grabacion', style: 'estudio', question: 'Quiero armar un home studio básico.' })}><strong>Home studio</strong><span>Hasta ₡250 000 · grabar en casa</span></button>
        </div>
        <p className="micro-copy">El filtro del servidor considera presupuesto, tipo, existencias demo, compatibilidad y estilo. Gemini solo explica opciones candidatas ya filtradas.</p>
        <Link className="text-button" href="/tienda">Abrir el catálogo completo →</Link>
      </aside>
    </div>
    <section className="advice-conversation" aria-label="Conversación guardada en este navegador">
      <div className="conversation-heading"><div><span className="eyebrow">CONVERSACIÓN</span><h2>Opciones y respuestas</h2></div><span className="micro-copy">Solo visible en este navegador</span></div>
      <div className="chat-log" aria-live="polite" aria-relevant="additions text">{turns.map((turn, index) => <article className={`chat-bubble ${turn.role === 'user' ? 'chat-user' : 'chat-assistant'}`} key={`${index}-${turn.role}`}>
        <div className="chat-meta"><strong>{turn.role === 'user' ? 'Vos' : 'Digari Studio'}</strong>{turn.role === 'assistant' && turn.mode && <span className={`mode-chip ${turn.mode}`}>{turn.mode === 'gemini' ? 'Gemini · en línea' : 'Asesoría local'}</span>}</div>
        <p>{turn.text}</p>
        {turn.recommendations?.length ? <div className="advice-recommendations">{turn.recommendations.map((item) => <article className="advice-recommendation" key={item.productId}>
          <ProductImage productId={item.productId} productName={item.name} className="advice-product-image" />
          <span className="product-meta">{item.family} · ficha demo</span><h3><Link href={item.href}>{item.name}</Link></h3>
          <strong>{`₡${item.priceCrc.toLocaleString('es-CR')}`}</strong><p>{item.reason}</p>
          <p className="micro-copy">Estilos: {item.style.join(' · ') || 'No indicado'}<br />Compatible con: {item.compatible.join(' · ') || 'Sin compatibilidad indicada'}<br />Existencias de demostración: {item.stockDemo}.</p>
          <Link className="text-button" href={item.compareHref}>Comparar en la tienda →</Link>
        </article>)}</div> : null}
      </article>)}</div>
    </section>
  </div>;
}
