import type { GeminiContext } from './advisor';

const endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const supportedModels = new Set(['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite']);
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
export function supportedGeminiModel(value: string) { return supportedModels.has(value.trim()); }

const responseSchema = {
  type: 'object',
  properties: {
    recommendations: { type: 'array', maxItems: 3, items: { type: 'object', properties: { productId: { type: 'string' }, reason: { type: 'string' } }, required: ['productId', 'reason'], additionalProperties: false } },
    question: { type: ['string', 'null'] },
  },
  required: ['recommendations', 'question'],
  additionalProperties: false,
};

export async function requestGeminiAdvice(context: GeminiContext, options: { apiKey: string; model: string; fetcher?: typeof fetch }) {
  if (!supportedGeminiModel(options.model)) throw new Error('unsupported configured model');
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': options.apiKey },
    signal: AbortSignal.timeout(8_000),
    body: JSON.stringify({
      model: options.model,
      store: false,
      system_instruction: 'Responde en español como asesor musical. Trabaja únicamente con las preferencias estructuradas y los candidatos elegidos por el servidor, que ya consultó el inventario vigente completo. No inventes especificaciones, compatibilidad, precios ni existencias. No agregues productos; devuelve únicamente IDs de los candidatos recibidos y razones breves basadas en estilo, uso, resumen y compatibilidad. No elimines opciones solo porque falten preferencias cuando el usuario pidió el inventario o una recomendación general. No decidas compras, órdenes, pagos ni estados y no solicites datos personales.',
      input: JSON.stringify(context),
      generation_config: { max_output_tokens: 420, thinking_level: 'low' },
      response_format: { type: 'text', mime_type: 'application/json', schema: responseSchema },
    }),
  });
  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
  const payload = await response.json() as { status?: string; output_text?: string; interaction?: { status?: string; output_text?: string; steps?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> }; steps?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
  const interaction = payload.interaction ?? payload;
  if (interaction.status && interaction.status !== 'completed') throw new Error('Gemini did not complete the interaction');
  const text = interaction.output_text ?? interaction.steps?.flatMap((step) => step.type === 'model_output' ? step.content ?? [] : []).find((block) => block.type === 'text')?.text;
  if (!text || text.length > 2400) throw new Error('Gemini response was empty or too long');
  return JSON.parse(text) as unknown;
}
