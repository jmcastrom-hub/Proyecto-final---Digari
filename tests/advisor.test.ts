import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { products } from '../lib/catalog';
import { AdviceInputError, buildAdvice, parseAdviceInput, USE_OPTIONS } from '../lib/advisor';
import { createAdviceRateLimiter } from '../lib/advice-rate-limit';
import { DEFAULT_GEMINI_MODEL, requestGeminiAdvice, supportedGeminiModel } from '../lib/gemini-advice';

const styles = [...new Set(products.flatMap((product) => product.style))];
const completeInput = { budgetCrc: 80000, family: 'Guitarra acústica', style: 'folk', use: 'iniciacion', question: '¿Cuál es la diferencia?' };

describe('asesoría determinista y privacidad', () => {
  it('rechaza montos y estilos inválidos, pero pregunta por preferencias faltantes', () => {
    assert.throws(() => parseAdviceInput({ ...completeInput, budgetCrc: '80 mil' }, styles), AdviceInputError);
    assert.throws(() => parseAdviceInput({ ...completeInput, style: 'inexistente' }, styles), AdviceInputError);
    const parsed = parseAdviceInput({ question: 'Busco algo' }, styles);
    return buildAdvice(parsed, products).then((result) => { assert.equal(result.mode, 'local'); assert.match(result.question ?? '', /presupuesto.*tipo.*uso o estilo/i); });
  });
  it('devuelve seguimiento local cuando el presupuesto no alcanza', async () => {
    const result = await buildAdvice({ ...completeInput, budgetCrc: 1000 }, products);
    assert.equal(result.mode, 'local'); assert.equal(result.recommendations.length, 0); assert.match(result.question ?? '', /flexibilizar/);
  });
  it('funciona sin proveedor con hasta tres candidatos y motivos reproducibles', async () => {
    const result = await buildAdvice({ ...completeInput, budgetCrc: 180000, family: 'Guitarra eléctrica', style: 'rock', use: 'ensayo' }, products);
    assert.equal(result.mode, 'local'); assert.ok(result.recommendations.length > 0 && result.recommendations.length <= 3);
    assert.ok(result.recommendations.every((item) => item.href.startsWith('/productos/') && item.compareHref.startsWith('/tienda?compare=') && item.reason.includes('sintéticos')));
  });
  it('acepta IDs candidatos de un proveedor simulado y mantiene precio/stock del servidor', async () => {
    let received: unknown;
    const provider = async (context: unknown) => { received = context; const candidate = (context as { candidates: { id: string }[] }).candidates[0]; return { recommendations: [{ productId: candidate.id, reason: 'Su estilo folk coincide con tu búsqueda y el resumen indica práctica cómoda.' }], question: null }; };
    const result = await buildAdvice(completeInput, products, provider);
    assert.equal(result.mode, 'gemini'); assert.equal(result.recommendations[0].priceCrc, products.find((product) => product.id === result.recommendations[0].productId)?.priceCrc);
    assert.equal(result.recommendations[0].stockDemo, products.find((product) => product.id === result.recommendations[0].productId)?.stock);
    assert.ok(!('question' in (received as object))); assert.deepEqual((received as { preferences: { intent: string } }).preferences.intent, 'compare');
  });
  it('descarta IDs ajenos al conjunto y vuelve al filtro local', async () => {
    const result = await buildAdvice(completeInput, products, async () => ({ recommendations: [{ productId: 'fuera-del-catalogo', reason: 'Candidato inventado.' }], question: null }));
    assert.equal(result.mode, 'local'); assert.ok(result.recommendations.every((item) => item.productId !== 'fuera-del-catalogo'));
  });
  it('activa el fallback cuando el proveedor falla o devuelve texto no permitido', async () => {
    const down = await buildAdvice(completeInput, products, async () => { throw new Error('timeout'); });
    const inventedPrice = await buildAdvice(completeInput, products, async (context) => ({ recommendations: [{ productId: (context as { candidates: { id: string }[] }).candidates[0].id, reason: 'Cuesta ₡70000 y tiene mejor stock.' }], question: null }));
    assert.equal(down.mode, 'local'); assert.equal(inventedPrice.mode, 'local');
  });
});

describe('contrato REST de Interactions y límites', () => {
  it('usa un modelo listado oficialmente y envía una llamada sin almacenamiento de historial', async () => {
    assert.equal(DEFAULT_GEMINI_MODEL, 'gemini-3.8-flash'); assert.equal(supportedGeminiModel(DEFAULT_GEMINI_MODEL), true);
    let sentBody: Record<string, unknown> | undefined; let sentHeaders: Headers | undefined;
    const fakeFetch = async (_input: URL | RequestInfo, init?: RequestInit) => {
      sentBody = JSON.parse(String(init?.body)) as Record<string, unknown>; sentHeaders = new Headers(init?.headers);
      return Response.json({ status: 'completed', output_text: '{"recommendations":[{"productId":"acustica-luz","reason":"Coincide con el estilo y el resumen."}],"question":null}' });
    };
    const context = { preferences: { budgetCrc: 80000, family: 'Guitarra acústica', style: 'folk', use: 'iniciacion', intent: 'compare' as const }, candidates: [{ id: 'acustica-luz', name: 'Acústica demo', family: 'Guitarra acústica', priceCrc: 74900, stock: 4, style: ['folk'], compatible: ['principiante'], summary: 'Para práctica.' }] };
    const response = await requestGeminiAdvice(context, { apiKey: 'test-secret', model: DEFAULT_GEMINI_MODEL, fetcher: fakeFetch as typeof fetch });
    assert.equal((response as { recommendations: { productId: string }[] }).recommendations[0].productId, 'acustica-luz');
    assert.equal(sentBody?.store, false); assert.equal(sentBody?.model, 'gemini-3.8-flash'); assert.equal(sentHeaders?.get('x-goog-api-key'), 'test-secret');
    assert.ok(!JSON.stringify(sentBody).includes('¿Cuál es la diferencia?'));
  });
  it('limita solicitudes por intervalo y permite renovar la ventana', () => {
    const limit = createAdviceRateLimiter(2, 1000);
    assert.equal(limit('test', 0), true); assert.equal(limit('test', 10), true); assert.equal(limit('test', 20), false); assert.equal(limit('test', 1000), true);
  });
  it('mantiene el uso conversacional como catálogo de selecciones acotadas', () => {
    assert.ok(USE_OPTIONS.length >= 6); assert.ok(USE_OPTIONS.every((option) => option.label.length < 40));
  });
});
