import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { products, type Product } from './catalog';

const directory = join(process.cwd(), 'data');
const databasePath = process.env.DIGARI_DB_PATH ? resolve(process.env.DIGARI_DB_PATH) : join(directory, 'digari.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, family TEXT NOT NULL, category TEXT NOT NULL,
    price_crc INTEGER NOT NULL CHECK(price_crc >= 0), stock INTEGER NOT NULL CHECK(stock >= 0),
    style_json TEXT NOT NULL, compatible_json TEXT NOT NULL, summary TEXT NOT NULL,
    variant_label TEXT, variants_json TEXT NOT NULL, visual TEXT NOT NULL, icon TEXT NOT NULL,
    model_ref TEXT NOT NULL DEFAULT 'generic', audio_json TEXT NOT NULL DEFAULT 'null'
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, tracking_hash TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL, fulfillment TEXT NOT NULL, total_crc INTEGER NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS order_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL REFERENCES orders(id),
    product_id TEXT NOT NULL REFERENCES products(id), product_name TEXT NOT NULL,
    variant TEXT, quantity INTEGER NOT NULL, unit_price_crc INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS order_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL REFERENCES orders(id),
    from_status TEXT, to_status TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS service_requests (
    id TEXT PRIMARY KEY, tracking_hash TEXT NOT NULL UNIQUE, type TEXT NOT NULL,
    description TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS service_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL REFERENCES service_requests(id),
    from_status TEXT, to_status TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL
  );
`);
// Additive migration for databases created by P1; no orders, stock or events are replaced.
const productColumns = db.prepare('PRAGMA table_info(products)').all() as { name: string }[];
if (!productColumns.some((column) => column.name === 'model_ref')) db.exec("ALTER TABLE products ADD COLUMN model_ref TEXT NOT NULL DEFAULT 'generic'");
if (!productColumns.some((column) => column.name === 'audio_json')) db.exec("ALTER TABLE products ADD COLUMN audio_json TEXT NOT NULL DEFAULT 'null'");

export function withTransaction<T>(work: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

const count = db.prepare('SELECT COUNT(*) AS count FROM products').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`INSERT INTO products (id,name,family,category,price_crc,stock,style_json,compatible_json,summary,variant_label,variants_json,visual,icon,model_ref,audio_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const seed = (items: Product[]) => withTransaction(() => {
    for (const p of items) insert.run(p.id, p.name, p.family, p.category, p.priceCrc, p.stock, JSON.stringify(p.style), JSON.stringify(p.compatible), p.summary, p.variantLabel ?? null, JSON.stringify(p.variants), p.visual, p.icon, p.modelRef, JSON.stringify(p.audioNotes ?? null));
  });
  seed(products);
}
const updateModel = db.prepare('UPDATE products SET model_ref=?, audio_json=? WHERE id=?');
for (const item of products) updateModel.run(item.modelRef, JSON.stringify(item.audioNotes ?? null), item.id);

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), name: String(row.name), family: String(row.family), category: String(row.category),
    priceCrc: Number(row.price_crc), stock: Number(row.stock), style: JSON.parse(String(row.style_json)),
    compatible: JSON.parse(String(row.compatible_json)), summary: String(row.summary),
    variantLabel: row.variant_label ? String(row.variant_label) : undefined,
    variants: JSON.parse(String(row.variants_json)), visual: String(row.visual), icon: String(row.icon), modelRef: String(row.model_ref), audioNotes: JSON.parse(String(row.audio_json || 'null')) ?? undefined,
  };
}

export function listProducts(filters: { q?: string; family?: string; category?: string; minPrice?: number; maxPrice?: number; style?: string; inStock?: boolean } = {}) {
  const rows = db.prepare('SELECT * FROM products ORDER BY category, name').all() as Record<string, unknown>[];
  const q = filters.q?.trim().toLocaleLowerCase('es');
  return rows.map(mapProduct).filter((p) =>
    (!q || `${p.name} ${p.family} ${p.summary} ${p.style.join(' ')} ${p.compatible.join(' ')}`.toLocaleLowerCase('es').includes(q)) &&
    (!filters.family || p.family === filters.family) && (!filters.category || p.category === filters.category) &&
    (filters.minPrice === undefined || p.priceCrc >= filters.minPrice) && (filters.maxPrice === undefined || p.priceCrc <= filters.maxPrice) &&
    (!filters.style || p.style.includes(filters.style)) && (!filters.inStock || p.stock > 0));
}
export function getProduct(id: string) {
  const row = db.prepare('SELECT * FROM products WHERE id=?').get(id) as Record<string, unknown> | undefined;
  return row ? mapProduct(row) : undefined;
}
export { db };
