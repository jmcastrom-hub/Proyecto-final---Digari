import { listProducts } from '@/lib/db';
import { families } from '@/lib/catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const maxRaw = search.get('maxPrice'); const minRaw = search.get('minPrice');
  const maxPrice = maxRaw ? Number(maxRaw) : undefined; const minPrice = minRaw ? Number(minRaw) : undefined;
  if ((maxRaw && (!Number.isSafeInteger(maxPrice) || maxPrice! < 0)) || (minRaw && (!Number.isSafeInteger(minPrice) || minPrice! < 0)) || (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)) return Response.json({ error: 'Usa un rango válido de montos CRC.' }, { status: 400 });
  const q = search.get('q')?.slice(0, 80) ?? undefined;
  const family = search.get('family') ?? undefined;
  const category = search.get('category') ?? undefined;
  const style = search.get('style')?.slice(0, 40) ?? undefined;
  const items = listProducts({ q, family, category, minPrice, maxPrice, style, inStock: search.get('inStock') === 'true' });
  const all = listProducts();
  return Response.json({ items, total: items.length, families, categories: [...new Set(all.map((p) => p.category))], styles: [...new Set(all.flatMap((p) => p.style))] }, { headers: { 'Cache-Control': 'no-store' } });
}
