import { lookupOrder } from '@/lib/orders';
import { validTrackingCode } from '@/lib/tracking';
import '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { trackingCode?: unknown };
    if (!validTrackingCode(body.trackingCode)) return Response.json({ error: 'Ingresa un código de seguimiento válido.' }, { status: 400 });
    const result = lookupOrder(body.trackingCode);
    if (!result) return Response.json({ error: 'No encontramos un pedido con ese código.' }, { status: 404 });
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'No se pudo consultar el pedido.' }, { status: 400 });
  }
}
