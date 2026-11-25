import { buildAdvice, AdviceInputError, parseAdviceInput } from '@/lib/advisor';
import { createAdviceRateLimiter } from '@/lib/advice-rate-limit';
import { DEFAULT_GEMINI_MODEL, requestGeminiAdvice, supportedGeminiModel } from '@/lib/gemini-advice';
import { listProducts } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const allowRequest = createAdviceRateLimiter(12, 60_000);
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export async function POST(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const client = forwarded && forwarded.length <= 80 ? forwarded : 'local';
  if (!allowRequest(client)) return Response.json({ error: 'La asesoría está tomando una pausa breve. Podés volver a intentarlo en un minuto.' }, { status: 429, headers: { ...headers, 'Retry-After': '60' } });
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > 4096) return Response.json({ error: 'La consulta supera el tamaño máximo de 4 KB.' }, { status: 413, headers });
  let value: unknown;
  try {
    const text = await request.text();
    if (text.length > 4096) return Response.json({ error: 'La consulta supera el tamaño máximo de 4 KB.' }, { status: 413, headers });
    value = JSON.parse(text);
  } catch { return Response.json({ error: 'Envía una consulta JSON válida.' }, { status: 400, headers }); }
  const catalog = listProducts();
  let input;
  try { input = parseAdviceInput(value, [...new Set(catalog.flatMap((item) => item.style))], catalog.map((item) => item.id), [...new Set(catalog.map((item) => item.family))]); }
  catch (error) { return Response.json({ error: error instanceof AdviceInputError ? error.message : 'La consulta no es válida.' }, { status: 400, headers }); }
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const key = process.env.GEMINI_API_KEY?.trim();
  const provider = key && supportedGeminiModel(model) ? (context: Parameters<typeof requestGeminiAdvice>[0]) => requestGeminiAdvice(context, { apiKey: key, model }) : undefined;
  const result = await buildAdvice(input, catalog, provider);
  return Response.json(result, { headers });
}
