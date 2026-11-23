import { createService, InputError } from '@/lib/orders';
import '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    return Response.json(createService(await request.json()), { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: 'No se pudo registrar la solicitud demo.' }, { status: 500 });
  }
}
