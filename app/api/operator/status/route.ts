import { advanceStatus, ConflictError, InputError } from '@/lib/orders';
import '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { kind?: unknown; trackingCode?: unknown; nextStatus?: unknown; operatorToken?: unknown };
    return Response.json(advanceStatus(body.kind, body.trackingCode, body.nextStatus, body.operatorToken), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ConflictError) return Response.json({ error: error.message }, { status: 409 });
    if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: 'No se pudo actualizar el estado demo.' }, { status: 500 });
  }
}
