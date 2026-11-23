import { getProduct } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return Response.json({ error: 'No encontramos ese producto demo.' }, { status: 404 });
  return Response.json(product, { headers: { 'Cache-Control': 'no-store' } });
}
