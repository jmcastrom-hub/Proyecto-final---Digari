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

export type AdviceInput = { budgetCrc?: number; family?: string; style?: string; use?: string; question?: string };
export type GeminiContext = {
  preferences: { budgetCrc: number; family: string; style: string | null; use: string; intent: 'compare' | 'alternatives' | 'recommend' };
  candidates: Array<Pick<Product, 'id' | 'name' | 'family' | 'priceCrc' | 'stock' | 'style' | 'compatible' | 'summary'>>;
};
export type Recommendation = { productId: string; name: string; family: string; priceCrc: number; stockDemo: number; style: string[]; compatible: string[]; reason: string; href: string; compareHref: string };
export type AdviceResult = { mode: 'gemini' | 'local'; message: string; question: string | null; recommendations: Recommendation[] };
export type AdviceProvider = (context: GeminiContext) => Promise<unknown>;
export class AdviceInputError extends Error {}

export function parseAdviceInput(value: unknown, styles: string[]): AdviceInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AdviceInputError('Envía un objeto JSON con tus preferencias.');
  const raw = value as Record<string, unknown>;
  let budgetCrc: number | undefined;
  if (raw.budgetCrc !== undefined && raw.budgetCrc !== null && raw.budgetCrc !== '') {
    if (typeof raw.budgetCrc !== 'number' || !Number.isSafeInteger(raw.budgetCrc) || raw.budgetCrc < 1 || raw.budgetCrc > 10_000_000) throw new AdviceInputError('El presupuesto debe ser un monto entero en CRC entre 1 y 10 000 000.');
    budgetCrc = raw.budgetCrc;
  }
  const textField = (key: 'family' | 'style' | 'use' | 'question', max: number): string | undefined => {
    const field = raw[key];
    if (field === undefined || field === null || field === '') return undefined;
    if (typeof field !== 'string' || field.trim().length > max) throw new AdviceInputError(`El campo ${key} no es válido o excede ${max} caracteres.`);
    return field.trim();
  };
  const family = textField('family', 60); const style = textField('style', 40); const use = textField('use', 32); const question = textField('question', 240);
  if (family && !families.includes(family)) throw new AdviceInputError('Selecciona un tipo disponible en el catálogo demo.');
  if (style && !styles.includes(style)) throw new AdviceInputError('Selecciona un estilo disponible en el catálogo demo.');
  if (use && !USE_OPTIONS.some((option) => option.id === use)) throw new AdviceInputError('Selecciona un uso de la lista disponible.');
  return { budgetCrc, family, style, use, question };
}

function normalize(text: string) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es'); }
function classifyIntent(question = ''): GeminiContext['preferences']['intent'] {
  const value = normalize(question);
  if (/compar|diferenc|entre estas|cual conviene/.test(value)) return 'compare';
  if (/alternativ|otra opcion|mas econom|mas barato|similar/.test(value)) return 'alternatives';
  return 'recommend';
}
function missingQuestion(input: AdviceInput) {
  const missing: string[] = [];
  if (!input.budgetCrc) missing.push('un presupuesto aproximado en CRC');
  if (!input.family) missing.push('el tipo de producto');
  if (!input.use && !input.style) missing.push('el uso o estilo que prefieres');
  if (!missing.length) return null;
  return `Para recomendarte con criterio, dime ${missing.join(', ')}.`;
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
  const pool = catalog.filter((product) => product.stock > 0 && product.priceCrc <= input.budgetCrc! && product.family === input.family && (!input.style || product.style.includes(input.style)) && (!input.use || matchesUse(product, input.use)));
  const ranked = pool.map((product) => ({ product, score: (input.style && product.style.includes(input.style) ? 2 : 0) + (input.use && matchesUse(product, input.use) ? 1 : 0) })).sort((a, b) => b.score - a.score || a.product.priceCrc - b.product.priceCrc || a.product.name.localeCompare(b.product.name, 'es')).slice(0, 3).map(({ product }) => product);
  if (!ranked.length) return { mode: 'local', message: 'No encontré fichas demo con stock que cumplan a la vez tu presupuesto, tipo y compatibilidad. Puedes ampliar el presupuesto o ajustar uso/estilo.', question: '¿Qué criterio prefieres flexibilizar?', recommendations: [] };
  const localRecommendations = ranked.map((product) => recommendation(product, deterministicReason(product, input)));
  if (!provider) return { mode: 'local', message: 'Asesoría local: filtré el catálogo demo con los mismos criterios, sin conectar con Gemini.', question: null, recommendations: localRecommendations };
  const context: GeminiContext = {
    preferences: { budgetCrc: input.budgetCrc!, family: input.family!, style: input.style ?? null, use: input.use!, intent: classifyIntent(input.question) },
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
