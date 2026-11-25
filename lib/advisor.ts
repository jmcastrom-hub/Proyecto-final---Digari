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
export type AdviceResult = { mode: 'gemini' | 'local'; message: string; question: string | null; recommendations: Recommendation[] };
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

export function parseAdviceInput(value: unknown, styles: string[], productIds?: string[]): AdviceInput {
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
  if (family && !families.includes(family) && !['Guitarra', 'Piano'].includes(family)) throw new AdviceInputError('Selecciona un tipo disponible en el catálogo demo.');
  if (style && !styles.includes(style)) throw new AdviceInputError('Selecciona un estilo disponible en el catálogo demo.');
  if (use && !USE_OPTIONS.some((option) => option.id === use)) throw new AdviceInputError('Selecciona un uso de la lista disponible.');
  let previousRecommendationIds: string[] = [];
  if (raw.previousRecommendationIds !== undefined) {
    if (!Array.isArray(raw.previousRecommendationIds) || raw.previousRecommendationIds.length > 3 || raw.previousRecommendationIds.some((id) => typeof id !== 'string' || (productIds && !productIds.includes(id)))) throw new AdviceInputError('Las referencias de la conversación no son válidas.');
    previousRecommendationIds = [...new Set(raw.previousRecommendationIds as string[])];
  }
  // Follow-ups may revise one field without resubmitting the preference form.
  let resolvedBudget = budgetCrc;
  const budgetUpdate = question && /presupuesto|monto|sub[ií]|aument[eé]|hasta/i.test(question) ? question.match(/₡?\s*(\d[\d.,' ]*)\s*$/)?.[1] : undefined;
  if (budgetUpdate) resolvedBudget = parseBudgetCrc(budgetUpdate);
  const resolvedUse = question && /ensay|practic(?:ar|a)\s+con\s+(?:la\s+)?banda/i.test(question) ? 'ensayo' : use;
  return { budgetCrc: resolvedBudget, family, style, use: resolvedUse, question, conversationId, previousRecommendationIds };
}

function normalize(text: string) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es'); }
function classifyIntent(question = ''): GeminiContext['preferences']['intent'] {
  const value = normalize(question);
  if (/compar|diferenc|entre estas|cual conviene/.test(value)) return 'compare';
  if (/alternativ|otra opcion|mas econom|mas barato|similar/.test(value)) return 'alternatives';
  return 'recommend';
}
function missingQuestion(input: AdviceInput) {
  return input.family ? null : '¿Qué tipo de equipo estás buscando? Podés decirme una categoría, por ejemplo bajos, guitarras o pianos.';
}
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
  const parts = [`Precio de demostración ₡${product.priceCrc.toLocaleString('es-CR')}, dentro del límite indicado`];
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
  const followUp = missingQuestion(input);
  if (followUp) return { mode: 'local', message: 'Aún necesito algunos datos para filtrar opciones.', question: followUp, recommendations: [] };
  const cheaper = /m[aá]s\s+(?:barat|econ[oó]mic)|menos\s+costos/i.test(input.question ?? '');
  const prior = new Set(input.previousRecommendationIds ?? []);
  const priorProducts = catalog.filter((item) => prior.has(item.id));
  const previousFloor = priorProducts.length ? Math.max(...priorProducts.map((item) => item.priceCrc)) : undefined;
  const priceCeiling = cheaper && previousFloor !== undefined ? Math.min(input.budgetCrc ?? Number.MAX_SAFE_INTEGER, previousFloor - 1) : (input.budgetCrc ?? Number.MAX_SAFE_INTEGER);
  const pool = catalog.filter((product) => product.stock > 0 && product.priceCrc <= priceCeiling && familyMatches(product, input.family) && (!input.style || product.style.includes(input.style)) && (!input.use || matchesUse(product, input.use)) && (!cheaper || previousFloor === undefined || product.priceCrc < previousFloor) && (!cheaper || !prior.has(product.id)));
  const ranked = pool.map((product) => ({ product, score: (input.style && product.style.includes(input.style) ? 2 : 0) + (input.use && matchesUse(product, input.use) ? 1 : 0) })).sort((a, b) => b.score - a.score || a.product.priceCrc - b.product.priceCrc || a.product.name.localeCompare(b.product.name, 'es')).slice(0, 3).map(({ product }) => product);
  if (!ranked.length) {
    if (cheaper && priorProducts.length) return { mode: 'local', message: 'No encuentro otra ficha de esta categoría con existencias y precio inferior a la opción que ya vimos. Podés cambiar el tipo o ampliar el presupuesto.', question: null, recommendations: [] };
    const amount = input.budgetCrc === 0 ? '₡0' : input.budgetCrc === undefined ? 'sin presupuesto definido' : `₡${input.budgetCrc.toLocaleString('es-CR')}`;
    const message = cheaper && previousFloor !== undefined
      ? 'No encuentro una alternativa más barata dentro de esta categoría con existencias demo. Podés cambiar de tipo o revisar el catálogo completo.'
      : input.budgetCrc === 0
      ? 'Con ₡0 no hay una ficha demo disponible dentro de ese monto. Cuando querás, podés flexibilizar el presupuesto o probar otro tipo de equipo.'
      : input.family === 'Piano' ? 'En el catálogo demo no hay pianos acústicos ni pianos digitales todavía; sí hay teclados, que son una familia distinta. Puedo mostrarte teclados si te sirven.'
      : input.budgetCrc !== undefined ? `No encontré una ficha demo con existencias dentro de ${amount} para esos criterios. Si te parece, podés flexibilizar un poco el monto o ajustar el uso/estilo.` : 'No encontré opciones con existencias demo para este tipo de equipo.';
    return { mode: 'local', message, question: null, recommendations: [] };
  }
  const localRecommendations = ranked.map((product) => recommendation(product, deterministicReason(product, input)));
  if (!provider) return { mode: 'local', message: 'Asesoría local: filtré el catálogo demo con los mismos criterios, sin conectar con Gemini.', question: null, recommendations: localRecommendations };
  const context: GeminiContext = {
    preferences: { budgetCrc: input.budgetCrc, family: input.family, style: input.style ?? null, use: input.use ?? null, intent: classifyIntent(input.question) },
    candidates: ranked.map(({ id, name, family, priceCrc, stock, style, compatible, summary }) => ({ id, name, family, priceCrc, stock, style, compatible, summary })),
  };
  try {
    const generated = await provider(context);
    if (!generated || typeof generated !== 'object' || Array.isArray(generated)) throw new Error('invalid response');
    const data = generated as Record<string, unknown>;
    if (!Array.isArray(data.recommendations) || data.recommendations.length < 1 || data.recommendations.length > 3) throw new Error('invalid recommendations');
    const mapped: Recommendation[] = []; const seen = new Set<string>();
    for (const value of data.recommendations) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid recommendation');
      const item = value as Record<string, unknown>; const product = ranked.find((candidate) => candidate.id === item.productId); const reason = safeGeneratedReason(item.reason);
      if (!product || seen.has(product.id) || !reason) throw new Error('recommendation outside candidates');
      seen.add(product.id); mapped.push(recommendation(product, reason));
    }
    const question = data.question === null || data.question === undefined ? null : typeof data.question === 'string' && data.question.length <= 200 && !/[\r\n<>]/.test(data.question) ? data.question : (() => { throw new Error('invalid question'); })();
    return { mode: 'gemini', message: 'Gemini explicó estas opciones utilizando únicamente candidatos filtrados del catálogo demo.', question, recommendations: mapped };
  } catch {
    return { mode: 'local', message: 'Gemini no respondió dentro del formato permitido; te muestro el filtro local con los mismos criterios.', question: null, recommendations: localRecommendations };
  }
}
