import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { products } from '../lib/catalog';
import { AdviceInputError, buildAdvice, parseAdviceInput, parseBudgetCrc, USE_OPTIONS } from '../lib/advisor';
import { createAdviceRateLimiter } from '../lib/advice-rate-limit';
import { DEFAULT_GEMINI_MODEL, requestGeminiAdvice, supportedGeminiModel } from '../lib/gemini-advice';
import { repairLegacyUtf8 } from '../lib/text-encoding';

const styles = [...new Set(products.flatMap((product) => product.style))];
const completeInput = { budgetCrc: 90000, family: 'Guitarra acústica', style: 'folk', use: 'iniciacion', question: '¿Cuál es la diferencia?' };

describe('asesoría determinista y privacidad', () => {
  it('responde disponibilidad por categoría sin exigir presupuesto, estilo o uso', async () => {
    const parsed = parseAdviceInput({ question: '¿Tienen bajos?', family: 'Bajo' }, styles, products.map((item) => item.id));
    const result = await buildAdvice(parsed, products);
    assert.equal(result.mode, 'local');
    assert.equal(result.recommendations[0]?.productId, 'bajo-marea');
    assert.match(result.message, /Asesoría local/);
  });
  it('aclara que piano y teclado son familias distintas cuando no hay pianos demo', async () => {
    const parsed = parseAdviceInput({ question: 'Busco un piano por ₡200 000', family: 'Piano', budgetCrc: 200000 }, styles, products.map((item) => item.id));
    const result = await buildAdvice(parsed, products);
    assert.equal(result.recommendations.length, 0);
    assert.match(result.message, /pianos digitales.*teclados.*familia distinta/i);
  });
  it('permite guitarra acústica y eléctrica dentro del presupuesto solicitado', async () => {
    const parsed = parseAdviceInput({ question: 'Busco una guitarra por ₡150 000', family: 'Guitarra', budgetCrc: 150000 }, styles, products.map((item) => item.id));
    const result = await buildAdvice(parsed, products);
    assert.deepEqual(new Set(result.recommendations.map((item) => item.family)), new Set(['Guitarra acústica', 'Guitarra eléctrica']));
    assert.ok(result.recommendations.every((item) => item.priceCrc <= 150000));
  });
  it('corrige texto UTF-8 legado en conversaciones ya guardadas', () => {
    assert.equal(repairLegacyUtf8('Pr\u00c3\u00a1ctica de guitarra'), 'Práctica de guitarra');
    assert.equal(repairLegacyUtf8('Guitarra acústica'), 'Guitarra acústica');
  });
  it('acepta montos enteros inclusivos con separadores y distingue vacío de cero', () => {
    assert.equal(parseBudgetCrc('0'), 0);
    assert.equal(parseBudgetCrc('₡1'), 1);
    assert.equal(parseBudgetCrc('10 000 000'), 10_000_000);
    assert.equal(parseBudgetCrc('₡10.000.000'), 10_000_000);
    assert.equal(parseBudgetCrc(''), undefined);
    assert.throws(() => parseBudgetCrc('-1'), AdviceInputError);
    assert.throws(() => parseBudgetCrc('10 000 001'), AdviceInputError);
  });
  it('rechaza montos y estilos inválidos, pero pregunta por preferencias faltantes', () => {
    assert.throws(() => parseAdviceInput({ ...completeInput, budgetCrc: '80 mil' }, styles), AdviceInputError);
    assert.throws(() => parseAdviceInput({ ...completeInput, style: 'inexistente' }, styles), AdviceInputError);
    const parsed = parseAdviceInput({ question: 'Busco algo' }, styles);
    return buildAdvice(parsed, products).then((result) => { assert.equal(result.mode, 'local'); assert.match(result.question ?? '', /tipo de equipo/i); });
  });
  it('devuelve seguimiento local cuando el presupuesto no alcanza', async () => {
    const result = await buildAdvice({ ...completeInput, budgetCrc: 1000 }, products);
    assert.equal(result.mode, 'local'); assert.equal(result.recommendations.length, 0); assert.match(result.message, /flexibilizar/);
  });
  it('explica con tacto que cero no alcanza para un producto demo', async () => {
    const result = await buildAdvice({ ...completeInput, budgetCrc: 0 }, products);
    assert.equal(result.recommendations.length, 0);
    assert.match(result.message, /₡0/);
    assert.match(result.message, /podés flexibilizar el presupuesto/i);
  });
  it('funciona sin proveedor con hasta tres candidatos y motivos reproducibles', async () => {
    const result = await buildAdvice({ ...completeInput, budgetCrc: 180000, family: 'Guitarra eléctrica', style: 'rock', use: 'ensayo' }, products);
    assert.equal(result.mode, 'local'); assert.ok(result.recommendations.length > 0 && result.recommendations.length <= 3);
    assert.ok(result.recommendations.every((item) => item.href.startsWith('/productos/') && item.compareHref.startsWith('/tienda?compare=') && item.reason.includes('sintéticos')));
  });
  it('mantiene compatibilidad declarada al filtrar la recomendación por uso', async () => {
    const result = await buildAdvice(completeInput, products);
    assert.deepEqual(result.recommendations.map((item) => item.productId), ['acustica-luz']);
    assert.ok(result.recommendations[0].compatible.includes('principiante'));
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
  it('usa el filtro local ante respuestas de proveedor 429 o 503', async () => {
    for (const status of [429, 503]) {
      const result = await buildAdvice(completeInput, products, async () => { throw Object.assign(new Error('provider unavailable'), { status }); });
      assert.equal(result.mode, 'local');
      assert.ok(result.recommendations.length > 0);
    }
  });
  it('continúa una conversación estructurada con filtro más barato, cambio de presupuesto y uso', async () => {
    const catalog = products;
    const first = await buildAdvice({ ...completeInput, budgetCrc:100000 }, catalog);
    const cheaper = await buildAdvice({ ...completeInput, budgetCrc:100000, question:'¿Hay algo más barato?', previousRecommendationIds:first.recommendations.map((item) => item.productId) }, catalog);
    assert.equal(cheaper.mode, 'local'); assert.equal(cheaper.recommendations.length,0); assert.match(cheaper.message,/No encuentro otra ficha/);
    const updated = parseAdviceInput({ ...completeInput, budgetCrc:100000, question:'Subí el presupuesto a ₡150 000', conversationId:'123e4567-e89b-12d3-a456-426614174000', previousRecommendationIds:['acustica-luz'] }, styles, catalog.map((item) => item.id));
    assert.equal(updated.budgetCrc,150000);
    assert.throws(() => parseAdviceInput({ ...completeInput, conversationId:'x', previousRecommendationIds:['missing-product'] }, styles, catalog.map((item) => item.id)), AdviceInputError);
    const rehearsal = parseAdviceInput({ ...completeInput, budgetCrc:100000, question:'¿Me sirve para ensayar?', previousRecommendationIds:['acustica-luz'] }, styles, catalog.map((item) => item.id));
    assert.equal(rehearsal.use,'ensayo'); assert.deepEqual(rehearsal.previousRecommendationIds,['acustica-luz']);
    const gemini = await buildAdvice({ ...completeInput, budgetCrc:100000 }, catalog, async (ctx) => ({ recommendations:[{productId:ctx.candidates[0].id,reason:'La ficha coincide con tus preferencias de práctica.'}],question:null }));
    const local = await buildAdvice({ ...completeInput, budgetCrc:100000 }, catalog, async () => { throw Object.assign(new Error('provider unavailable'),{status:503}); });
    assert.equal(gemini.mode,'gemini'); assert.equal(local.mode,'local');
    assert.deepEqual(local.recommendations.map((item) => item.productId),gemini.recommendations.map((item) => item.productId));
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
