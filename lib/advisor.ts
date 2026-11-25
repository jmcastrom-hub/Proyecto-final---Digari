import { families, type Product } from './catalog';

export const USE_OPTIONS = [
  { id: 'iniciacion', label: 'Aprender o empezar', terms: ['principiante', 'práctica', 'acompañamiento', 'didáctico'] },
  { id: 'practica-casa', label: 'Práctica en casa', terms: ['práctica', 'casa', 'personal', 'iniciación'] },
  { id: 'ensayo', label: 'Ensayo', terms: ['ensayo', 'voz', 'guitarra', 'bajo'] },
  { id: 'grabacion', label: 'Grabación en casa', terms: ['grabación', 'estudio', 'micrófono', 'USB-C'] },
  { id: 'mezcla', label: 'Mezcla y monitoreo', terms: ['mezcla', 'estudio', 'monitoreo', 'par estéreo'] },
  { id: 'voz', label: 'Voz o presentaciones', terms: ['voz', 'micrófono', 'XLR', 'parlante'] },
  { id: 'eventos', label: 'Eventos pequeños', terms: ['eventos', 'voz', 'parlante', 'XLR'] },
  { id: 'dj', label: 'Mezcla DJ', terms: ['DJ', 'electrónica', 'controlador', 'mezcla'] },
] as const;

export type AdviceInput = { budgetCrc?: number; family?: string; style?: string; use?: string; question?: string; conversationId?: string; previousRecommendationIds?: string[] };
export type GeminiContext = {
  preferences: { budgetCrc?: number; family?: string; style: string | null; use: string | null; intent: 'compare' | 'alternatives' | 'recommend' };
  candidates: Array<Pick<Product, 'id' | 'name' | 'family' | 'priceCrc' | 'stock' | 'style' | 'compatible' | 'summary'>>;
};
export type Recommendation = { productId: string; name: string; family: string; priceCrc: number; stockDemo: number; style: string[]; compatible: string[]; reason: string; href: string; compareHref: string };
export type AdviceResult = { mode: 'gemini' | 'local'; message: string; question: string | null; recommendations: Recommendation[]; alternatives?: Recommendation[]; hasMore?: boolean };
export type AdviceProvider = (context: GeminiContext) => Promise<unknown>;
export class AdviceInputError extends Error {}

const MAX_BUDGET_CRC = 10_000_000;
const budgetMessage = 'Ingresá un monto entero entre ₡0 y ₡10 000 000.';

export function parseBudgetCrc(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0 || value > MAX_BUDGET_CRC) throw new AdviceInputError(budgetMessage);
    return value;
  }
  if (typeof value !== 'string') throw new AdviceInputError(budgetMessage);
  let text = value.trim().replace(/^₡\s*/, '');
  if (!text) return undefined;
  if (!/^\d+$/.test(text)) {
    const grouped = /^(\d{1,3})([.,'\u00a0\u202f ])(\d{3})(?:\2\d{3})*$/.exec(text);
    if (!grouped) throw new AdviceInputError(budgetMessage);
    text = text.replace(/[.,'\u00a0\u202f ]/g, '');
  }
  const amount = Number(text);
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > MAX_BUDGET_CRC) throw new AdviceInputError(budgetMessage);
  return amount;
}

export function parseAdviceInput(value: unknown, styles: string[], productIds?: string[], availableFamilies: string[] = families): AdviceInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AdviceInputError('Envía un objeto JSON con tus preferencias.');
  const raw = value as Record<string, unknown>;
  const budgetCrc = parseBudgetCrc(raw.budgetCrc);
  const textField = (key: 'family' | 'style' | 'use' | 'question', max: number): string | undefined => {
    const field = raw[key];
    if (field === undefined || field === null || field === '') return undefined;
    if (typeof field !== 'string' || field.trim().length > max) throw new AdviceInputError(`El campo ${key} no es válido o excede ${max} caracteres.`);
    return field.trim();
  };
  const family = textField('family', 60); const style = textField('style', 40); const use = textField('use', 32); const question = textField('question', 240);
  const conversationId = raw.conversationId === undefined ? undefined : typeof raw.conversationId === 'string' && /^[a-f0-9-]{36}$/i.test(raw.conversationId) ? raw.conversationId : (() => { throw new AdviceInputError('El identificador de conversación no es válido.'); })();
  const normalizedQuestion = normalize(question ?? '');
  const broadInventory = /\b(qu[eé]|que)\b.*\b(instrumentos?|equipos?|productos?|cat[aá]logo)\b.*\b(ten[eé]s|hay|disponibles?|ofrec[eé]s)\b/i.test(normalizedQuestion);
  const explicitFamily = availableFamilies.find((item) => normalizedQuestion.includes(normalize(item)))
    ?? (/\bguitarra(?:s)?\b/.test(normalizedQuestion) ? 'Guitarra' : undefined)
    ?? (/\bpiano(?:s)?\b/.test(normalizedQuestion) ? 'Piano' : undefined)
    ?? (/\bbajo(?:s)?\b/.test(normalizedQuestion) ? 'Bajo' : undefined);
  const resolvedFamily = broadInventory ? undefined : explicitFamily ?? family;
  if (resolvedFamily && !availableFamilies.includes(resolvedFamily) && !['Guitarra', 'Piano'].includes(resolvedFamily)) throw new AdviceInputError('Selecciona un tipo disponible en el catálogo demo.');
  const requestedStyle = broadInventory ? undefined : style;
  if (requestedStyle && !styles.includes(requestedStyle)) throw new AdviceInputError('Selecciona un estilo disponible en el catálogo demo.');
  if (use && !USE_OPTIONS.some((option) => option.id === use)) throw new AdviceInputError('Selecciona un uso de la lista disponible.');
  let previousRecommendationIds: string[] = [];
  if (raw.previousRecommendationIds !== undefined) {
    if (!Array.isArray(raw.previousRecommendationIds) || raw.previousRecommendationIds.length > 100 || raw.previousRecommendationIds.some((id) => typeof id !== 'string' || (productIds && !productIds.includes(id)))) throw new AdviceInputError('Las referencias de la conversación no son válidas.');
    previousRecommendationIds = [...new Set(raw.previousRecommendationIds as string[])];
  }
  // Follow-ups may revise one field without resubmitting the preference form.
  let resolvedBudget = broadInventory ? undefined : budgetCrc;
  const budgetUpdate = question?.match(/(?:m[aá]ximo|maximo|presupuesto|monto|sub[ií]|aument[eé]|hasta|tope|por)\s*(?:(?:de|a)\s*)?₡?\s*(\d[\d.,' ]*)/i)?.[1];
  if (budgetUpdate) resolvedBudget = parseBudgetCrc(budgetUpdate);
  const resolvedUse = question && /ensay|practic(?:ar|a)\s+con\s+(?:la\s+)?banda/i.test(question) ? 'ensayo' : use;
  return { budgetCrc: resolvedBudget, family: resolvedFamily, style: requestedStyle, use: broadInventory ? undefined : resolvedUse, question, conversationId, previousRecommendationIds };
}

function normalize(text: string) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es'); }
function classifyIntent(question = ''): GeminiContext['preferences']['intent'] {
  const value = normalize(question);
  if (/compar|diferenc|entre estas|cual conviene/.test(value)) return 'compare';
  if (/alternativ|otra opcion|mas econom|mas barato|similar/.test(value)) return 'alternatives';
  return 'recommend';
}
function isInventoryQuery(question = '') { return /\b(qu[eé]|que)\b.*\b(instrumentos?|equipos?|productos?|cat[aá]logo)\b.*\b(ten[eé]s|hay|disponibles?|ofrec[eé]s)\b/i.test(normalize(question)); }
function isBeginnerQuery(question = '') { return /\b(empezar|principiante|para iniciar|estoy empezando)\b/i.test(normalize(question)); }
function isMoreQuery(question = '') { return /\b(mostr[aá]me|mostrame|ver|dame)\s+m[aá]s\b|\bm[aá]s opciones\b/i.test(normalize(question)); }
function familyMatches(product: Product, family?: string) {
  if (!family) return true;
  const value = normalize(family);
  if (value === 'guitarra') return ['Guitarra acústica', 'Guitarra eléctrica'].includes(product.family);
  if (value === 'piano') return normalize(product.family) === 'piano digital';
  return normalize(product.family) === normalize(family);
}
function matchesUse(product: Product, useId: string) {
  const option = USE_OPTIONS.find((item) => item.id === useId); if (!option) return true;
  const searchable = normalize([...product.style, ...product.compatible, product.summary, product.family, product.category].join(' '));
  return option.terms.some((term) => searchable.includes(normalize(term)));
}
function recommendation(product: Product, reason: string): Recommendation {
  return { productId: product.id, name: product.name, family: product.family, priceCrc: product.priceCrc, stockDemo: product.stock, style: product.style, compatible: product.compatible, reason, href: `/productos/${product.id}`, compareHref: `/tienda?compare=${encodeURIComponent(product.id)}` };
}
function deterministicReason(product: Product, input: AdviceInput) {
  const parts = [`Precio de demostración ₡${product.priceCrc.toLocaleString('es-CR')}`];
  if (input.budgetCrc !== undefined) parts.push('dentro del límite indicado');
  else parts.push('con existencias en el catálogo demo');
  if (input.style && product.style.includes(input.style)) parts.push(`coincide con el estilo ${input.style}`);
  if (input.use) parts.push(`sus datos de uso y compatibilidad encajan con ${USE_OPTIONS.find((option) => option.id === input.use)?.label.toLocaleLowerCase('es')}`);
  if (product.compatible.length) parts.push(`compatibilidad declarada en la ficha: ${product.compatible.slice(0, 2).join(', ')}`);
  return `${parts.join('; ')}. Datos sintéticos del catálogo.`;
}
function safeGeneratedReason(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const reason = value.replace(/[\u0000-\u001f<>]/g, '').trim();
  if (!reason || reason.length > 240 || /₡|\bCRC\b|colones|precio|stock|existencias|disponibilidad/i.test(reason)) return undefined;
  return reason;
}

export async function buildAdvice(input: AdviceInput, catalog: Product[], provider?: AdviceProvider): Promise<AdviceResult> {
  const questionText = input.question ?? '';
  const inventoryQuery = isInventoryQuery(questionText);
  const instrumentsQuery = inventoryQuery && /instrument/i.test(normalize(questionText));
  const beginnerQuery = isBeginnerQuery(questionText);
  const moreQuery = isMoreQuery(questionText);
  const cheaper = /m[aá]s\s+(?:barat|econ[oó]mic)|menos\s+costos/i.test(questionText);
  const prior = new Set(input.previousRecommendationIds ?? []);
  const priorProducts = catalog.filter((item) => prior.has(item.id));
  const previousFloor = priorProducts.length ? Math.max(...priorProducts.map((item) => item.priceCrc)) : undefined;
  const priceCeiling = cheaper && previousFloor !== undefined ? Math.min(input.budgetCrc ?? Number.MAX_SAFE_INTEGER, previousFloor - 1) : (input.budgetCrc ?? Number.MAX_SAFE_INTEGER);
  const basePool = catalog.filter((product) => product.stock > 0 && familyMatches(product, input.family) && (!(instrumentsQuery || beginnerQuery) || product.category === 'Instrumentos') && (!(beginnerQuery || input.use) || beginnerQuery || matchesUse(product, input.use!)) && (!input.style || product.style.includes(input.style)));
  const unpricedPool = basePool.filter((product) => (!cheaper || previousFloor === undefined || product.priceCrc < previousFloor) && (!cheaper || !prior.has(product.id)));
  const eligible = unpricedPool.filter((product) => product.priceCrc <= priceCeiling && (!moreQuery || !prior.has(product.id)));
  const scored = eligible.map((product) => ({
    product,
    score: (input.style && product.style.includes(input.style) ? 5 : 0) +
      (input.use && matchesUse(product, input.use) ? 2 : 0) +
      (beginnerQuery && matchesUse(product, 'iniciacion') ? 4 : 0) +
      (beginnerQuery && product.compatible.some((item) => normalize(item).includes('principiante')) ? 6 : 0) +
      (beginnerQuery && product.category === 'Instrumentos' ? 2 : 0),
  })).sort((a, b) => b.score - a.score || a.product.priceCrc - b.product.priceCrc || a.product.name.localeCompare(b.product.name, 'es'));
  const diversePool = (inventoryQuery || beginnerQuery) ? (() => {
    const group = (product: Product) => instrumentsQuery ? product.family : product.category;
    const used = new Set<string>();
    const diverse = scored.filter(({ product }) => { const key = group(product); if (used.has(key)) return false; used.add(key); return true; });
    const diverseIds = new Set(diverse.map(({ product }) => product.id));
    return [...diverse, ...scored.filter(({ product }) => !diverseIds.has(product.id))];
  })() : scored;
  const chosen = diversePool.slice(0, 3).map(({ product }) => product);
  const hasMore = eligible.length > chosen.length;
  const amount = input.budgetCrc === 0 ? '₡0' : input.budgetCrc === undefined ? '' : `₡${input.budgetCrc.toLocaleString('es-CR')}`;
  if (!chosen.length) {
    if (input.family === 'Piano') return { mode: 'local', message: 'No tenemos pianos acústicos ni digitales en el catálogo demo. Sí hay teclados, que son una familia distinta. Puedo mostrarte esas opciones si te sirven.', question: null, recommendations: [] };
    const alternatives = input.budgetCrc === undefined ? [] : unpricedPool.filter((product) => product.priceCrc > input.budgetCrc!).sort((a, b) => a.priceCrc - b.priceCrc).slice(0, 3).map((product) => recommendation(product, `Alternativa de demostración: ₡${product.priceCrc.toLocaleString('es-CR')}, por encima de tu tope de ${amount}.`));
    const message = cheaper && priorProducts.length
      ? 'No encuentro otra ficha con existencias demo por debajo del precio que vimos.'
      : input.budgetCrc !== undefined
        ? `${input.budgetCrc === 0 ? 'Con ₡0' : `No encontré coincidencias dentro de ${amount}`} para esa consulta.${alternatives.length ? ' Te separo alternativas de demostración que superan el tope; podés flexibilizar el monto si te sirven.' : ' Podés flexibilizar el monto o cambiar los criterios.'}`
        : 'No encontré opciones con existencias demo para esa consulta.';
    return { mode: 'local', message, question: null, recommendations: [], alternatives };
  }
  const localRecommendations = chosen.map((product) => recommendation(product, deterministicReason(product, input)));
  const familyNames = [...new Set(basePool.map((product) => product.family))];
  const summary = inventoryQuery
    ? `${instrumentsQuery ? 'Instrumentos' : 'Equipo'} con existencias demo en ${familyNames.length} familias: ${familyNames.join(', ')}. Te muestro ejemplos variados del catálogo; precios y stock son de demostración.`
    : beginnerQuery
      ? 'Para empezar, estas opciones del catálogo demo son variadas y tienen existencias. Compará su uso y compatibilidad en cada ficha.'
      : cheaper
        ? 'Estas son opciones del catálogo demo por debajo del precio que ya vimos.'
        : 'Asesoría local: revisé las fichas vigentes de SQLite con tus criterios. Precios y existencias son de demostración.';
  const message = `${summary}${hasMore ? ' Hay más opciones; escribí «mostrame más» para ver otras sin repetir.' : ''}`;
  if (!provider) return { mode: 'local', message, question: null, recommendations: localRecommendations, hasMore };
  const context: GeminiContext = {
    preferences: { budgetCrc: input.budgetCrc, family: input.family, style: input.style ?? null, use: input.use ?? null, intent: classifyIntent(input.question) },
    candidates: chosen.map(({ id, name, family, priceCrc, stock, style, compatible, summary }) => ({ id, name, family, priceCrc, stock, style, compatible, summary })),
  };
  try {
    const generated = await provider(context);
    if (!generated || typeof generated !== 'object' || Array.isArray(generated)) throw new Error('invalid response');
    const data = generated as Record<string, unknown>;
    if (!Array.isArray(data.recommendations) || data.recommendations.length < 1 || data.recommendations.length > 3) throw new Error('invalid recommendations');
    const mapped: Recommendation[] = []; const seen = new Set<string>();
    for (const value of data.recommendations) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid recommendation');
      const item = value as Record<string, unknown>; const product = chosen.find((candidate) => candidate.id === item.productId); const reason = safeGeneratedReason(item.reason);
      if (!product || seen.has(product.id) || !reason) throw new Error('recommendation outside candidates');
      seen.add(product.id); mapped.push(recommendation(product, reason));
    }
    const question = data.question === null || data.question === undefined ? null : typeof data.question === 'string' && data.question.length <= 200 && !/[\r\n<>]/.test(data.question) ? data.question : (() => { throw new Error('invalid question'); })();
    return { mode: 'gemini', message: `${message} Gemini añadió una explicación a estas opciones.`, question, recommendations: mapped, hasMore };
  } catch {
    return { mode: 'local', message: `${message} Gemini no respondió; te muestro la selección local.`, question: null, recommendations: localRecommendations, hasMore };
  }
}
