'use client';

import Link from 'next/link';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { parseBudgetCrc, USE_OPTIONS, type AdviceResult, type Recommendation } from '@/lib/advisor';
import { repairLegacyUtf8 } from '@/lib/text-encoding';
import { ProductImage } from '@/components/product-image';

type Preferences = { budgetCrc: string; family: string; style: string; use: string };
type Turn = { role: 'user' | 'assistant'; text: string; mode?: 'gemini' | 'local'; recommendations?: Recommendation[] };
type Stored = { preferences: Preferences; turns: Turn[]; conversationId?: string };
type Props = { families: string[]; styles: string[] };
const storageKey = 'digari-advice-chat-v1';
const initialPreferences: Preferences = { budgetCrc: '', family: '', style: '', use: '' };
const welcome: Turn = { role: 'assistant', text: '¡Hola! Contame qué equipo estás buscando. Podés empezar con texto libre y vamos afinando la recomendación en esta conversación.', mode: 'local' };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

function repairTurn(turn: Turn): Turn {
  return {
    ...turn,
    text: repairLegacyUtf8(turn.text),
    recommendations: turn.recommendations?.map((item) => ({
      ...item,
      name: repairLegacyUtf8(item.name), family: repairLegacyUtf8(item.family), reason: repairLegacyUtf8(item.reason),
      style: item.style.map(repairLegacyUtf8), compatible: item.compatible.map(repairLegacyUtf8),
    })),
  };
}

function inferPreferences(question: string, current: Preferences, families: string[], styles: string[]): Preferences {
  const normalized = normalize(question);
  const newSearch = /\b(busco|buscamos|quiero|necesito|ando buscando)\b/i.test(normalized);
  const result = newSearch ? { ...initialPreferences } : { ...current };
  const budget = /(?:₡\s*|\bcrc\s*|(?:presupuesto(?:\s+(?:de|a|hasta))?|monto(?:\s+de)?|por|hasta|tope(?:\s+de)?|maximo(?:\s+de)?)\s*₡?\s*)(\d[\d.,' ]*)/i.exec(question);
  if (budget) result.budgetCrc = budget[1].trim();
  const specificFamily = families.find((item) => normalized.includes(normalize(item)));
  const family = specificFamily ?? (/\bpiano(?:s)?\b/.test(normalized) ? 'Piano'
    : /\bbajo(?:s)?\b/.test(normalized) ? 'Bajo'
    : /\bguitarra(?:s)?\b/.test(normalized) ? 'Guitarra'
    : /\bteclado(?:s)?\b/.test(normalized) ? 'Teclado'
    : undefined);
  if (family) result.family = family;
  const style = styles.find((item) => new RegExp(`(?:^|[^\\p{L}\\p{N}])${normalize(item).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^\\p{L}\\p{N}])`, 'u').test(normalized));
  if (style) result.style = style;
  const explicitUse = USE_OPTIONS.find((option) => normalized.includes(normalize(option.id)) || normalized.includes(normalize(option.label)));
  if (explicitUse) result.use = explicitUse.id;
  else if (/\b(ensay|practic(?:ar|a) con la banda)\b/.test(normalized)) result.use = 'ensayo';
  else if (/\b(grab|home studio|grabar)\b/.test(normalized)) result.use = 'grabacion';
  else if (/\b(mezcl|monitore)\b/.test(normalized)) result.use = 'mezcla';
  else if (/\b(presentaci|hablar en publico|microfono para voz)\b/.test(normalized)) result.use = 'voz';
  else if (/\b(evento|actividad pequena)\b/.test(normalized)) result.use = 'eventos';
  else if (/\b(dj|mezcla dj)\b/.test(normalized)) result.use = 'dj';
  return result;
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
  const [conversationId, setConversationId] = useState('');
  const inFlight = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const budgetError = friendlyBudgetError(preferences.budgetCrc);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Stored;
        if (saved.preferences && Array.isArray(saved.turns)) {
          setConversationId(typeof saved.conversationId === 'string' && /^[a-f0-9-]{36}$/i.test(saved.conversationId) ? saved.conversationId : crypto.randomUUID());
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
    if (!localStorage.getItem(storageKey)) setConversationId(crypto.randomUUID());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify({ preferences, turns: turns.slice(-24), conversationId } satisfies Stored));
  }, [preferences, turns, conversationId, ready]);

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [turns, busy]);

  const change = (key: keyof Preferences, value: string) => setPreferences((current) => ({ ...current, [key]: value }));

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || busy) return;
    const question = composer.trim();
    if (!question) return;
    setError('');

    const nextPreferences = inferPreferences(question, preferences, families, styles);
    let budgetCrc: number | undefined;
    try { budgetCrc = parseBudgetCrc(nextPreferences.budgetCrc); }
    catch { setError('Revisá el presupuesto: debe ser un monto entero entre ₡0 y ₡10 000 000.'); return; }

    const activeUse = /ensay|practic(?:ar|a)\s+con\s+(?:la\s+)?banda/i.test(question) ? 'ensayo' : nextPreferences.use;
    const merged = { ...nextPreferences, use: activeUse };
    setPreferences(merged);
    setTurns((current) => [...current, { role: 'user' as const, text: question }].slice(-24));
    setComposer('');
    inFlight.current = true;
    setBusy(true);
    try {
      const prior = [...turns].reverse().find((turn) => turn.role === 'assistant' && turn.recommendations?.length)?.recommendations?.map((item) => item.productId) ?? [];
      const response = await fetch('/api/advice', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          conversationId, previousRecommendationIds: prior, budgetCrc, family: merged.family || undefined,
          style: merged.style || undefined, use: merged.use || undefined, question,
        }),
      });
      const data = await response.json() as AdviceResult | { error?: string };
      if (!response.ok || !('mode' in data)) {
        setError(response.status === 429 ? 'La asesoría está ocupada. Probá de nuevo en un minuto; la conversación quedó guardada.' : 'No pudimos completar la consulta. Tus mensajes y preferencias siguen guardados.');
        setTurns((current) => [...current, { role: 'assistant' as const, text: response.status === 503 ? 'Gemini no respondió. La asesoría local conserva tus criterios; podés intentar otra consulta.' : 'No pude completar esta consulta ahora. Tus criterios siguen acá para que podás volver a intentar.' }].slice(-24));
        return;
      }
      const answer = [data.message, data.question].filter(Boolean).join(' ');
      setTurns((current) => [...current, { role: 'assistant' as const, text: answer, mode: data.mode, recommendations: data.recommendations }].slice(-24));
    } catch {
      setError('No pudimos conectar con la asesoría. La conversación y tus criterios siguen guardados; podés volver a intentar.');
      setTurns((current) => [...current, { role: 'assistant' as const, text: 'La conexión no está disponible. Cuando querás, probá de nuevo; no se perdió la conversación.' }].slice(-24));
    } finally { inFlight.current = false; setBusy(false); }
  }

  function clearConversation() {
    setPreferences(initialPreferences);
    setTurns([welcome]);
    setConversationId(crypto.randomUUID());
    setComposer('');
    setError('');
    localStorage.removeItem(storageKey);
  }

  return <div className="container advice-page">
    <div className="advice-intro">
      <span className="eyebrow">DIGARI STUDIO / ASESORÍA DEMO</span>
      <h1>Hablemos de lo que necesitás.</h1>
      <p className="advice-lede">Escribí con tus palabras. Vamos a mantener tus preferencias durante la conversación y ajustar solo lo que cambie.</p>
    </div>

    <section className="advice-panel advice-chat-panel" aria-label="Conversación de asesoría">
      <div className="advice-panel-heading">
        <div><span className="eyebrow">ASESORÍA PERSONAL</span><h2>Tu conversación</h2></div>
        <button className="button button-outline button-small" type="button" onClick={clearConversation} disabled={busy}>Empezar de nuevo</button>
      </div>

      <details className="advice-preferences">
        <summary>Preferencias aprendidas <span>Opcionales · se aplican al próximo mensaje</span></summary>
        <div className="advice-fields">
          <label htmlFor="advice-budget">Presupuesto máximo (CRC)<input id="advice-budget" type="text" inputMode="numeric" autoComplete="off" maxLength={16} placeholder="Ej. 120 000" aria-invalid={Boolean(budgetError)} aria-describedby="advice-budget-help advice-budget-error" value={preferences.budgetCrc} onChange={(event) => change('budgetCrc', event.target.value)} /></label>
          <label htmlFor="advice-family">Tipo de equipo<select id="advice-family" value={preferences.family} onChange={(event) => change('family', event.target.value)}><option value="">Sin preferencia</option><option value="Guitarra">Guitarra acústica o eléctrica</option><option value="Piano">Piano (acústico o digital)</option>{families.map((family) => <option key={family} value={family}>{family}</option>)}</select></label>
          <label htmlFor="advice-use">Uso principal<select id="advice-use" value={preferences.use} onChange={(event) => change('use', event.target.value)}><option value="">Sin preferencia</option>{USE_OPTIONS.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label>
          <label htmlFor="advice-style">Estilo musical<select id="advice-style" value={preferences.style} onChange={(event) => change('style', event.target.value)}><option value="">Cualquier estilo</option>{styles.map((style) => <option value={style} key={style}>{style}</option>)}</select></label>
        </div>
        <small id="advice-budget-help" className="micro-copy">Podés usar espacios, puntos o comas. ₡0 es válido; vacío significa que todavía no definiste el monto.</small>
        {budgetError && <small id="advice-budget-error" className="field-error" role="alert">{budgetError}</small>}
      </details>

      <div className="chat-log" ref={logRef} aria-live="polite" aria-relevant="additions text" aria-label="Mensajes de la conversación">
        {turns.map((turn, index) => <article className={`chat-bubble ${turn.role === 'user' ? 'chat-user' : 'chat-assistant'}`} key={`${index}-${turn.role}`}>
          <div className="chat-meta"><strong>{turn.role === 'user' ? 'Vos' : 'Digari Studio'}</strong>{turn.role === 'assistant' && turn.mode && <span className={`mode-chip ${turn.mode}`}>{turn.mode === 'gemini' ? 'Gemini · en línea' : 'Asesoría local'}</span>}</div>
          <p>{turn.text}</p>
          {turn.recommendations?.length ? <div className="advice-recommendations">{turn.recommendations.map((item) => <article className="advice-recommendation" key={item.productId}>
            <ProductImage productId={item.productId} productName={item.name} className="advice-product-image" />
            <span className="product-meta">{item.family} · ficha demo</span><h3><Link href={item.href}>{item.name}</Link></h3>
            <strong>{`₡${item.priceCrc.toLocaleString('es-CR')}`}</strong><p>{item.reason}</p>
            <p className="micro-copy">Estilos: {item.style.join(' · ') || 'No indicado'}<br />Compatible con: {item.compatible.join(' · ') || 'Sin compatibilidad indicada'}<br />Existencias de demostración: {item.stockDemo}.</p>
            <Link className="text-button" href={item.compareHref}>Comparar en la tienda →</Link>
          </article>)}</div> : null}
        </article>)}
        {busy && <div className="chat-typing" role="status">Digari está revisando el catálogo demo…</div>}
      </div>

      <form className="advice-composer" onSubmit={submit}>
        <label htmlFor="advice-message">Escribí tu mensaje</label>
        <div className="advice-composer-row">
          <textarea id="advice-message" maxLength={240} rows={2} value={composer} onKeyDown={onComposerKeyDown} onChange={(event) => setComposer(event.target.value)} placeholder="Ej.: Busco una guitarra eléctrica para rock por ₡120 000" aria-describedby="advice-composer-help" />
          <button className="button" type="submit" disabled={busy || !composer.trim() || Boolean(budgetError)}>{busy ? 'Enviando…' : 'Enviar'}</button>
        </div>
        <div className="advice-composer-meta"><small id="advice-composer-help">Enter envía · Shift+Enter agrega una línea · máximo 240 caracteres</small><small>Un envío por mensaje. No usamos datos personales ni procesamos pedidos.</small></div>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
      </form>
    </section>
    <p className="advice-private-note">La conversación se guarda en este navegador. Precios, existencias y productos son de demostración.</p>
  </div>;
}
