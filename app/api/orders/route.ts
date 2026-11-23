import { ConflictError, createOrder, InputError } from '@/lib/orders';
import '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const result = createOrder(await request.json());
    return Response.json(result, { status: result.duplicate ? 200 : 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof ConflictError) return Response.json({ error: error.message }, { status: 409 });
    return Response.json({ error: 'No se pudo registrar el pedido demo. Inténtalo de nuevo.' }, { status: 500 });
  }
}
