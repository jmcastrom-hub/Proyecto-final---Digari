import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join, resolve, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, it } from 'node:test';

describe('migración aditiva del catálogo demo', () => {
  it('actualiza una ficha existente y conserva pedido, precio histórico, estado y servicio', () => {
    const file = join(dirname(process.env.DIGARI_DB_PATH!), `migration-${randomUUID()}.sqlite`);
    const init = `
      const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync(process.env.DIGARI_DB_PATH);
      db.exec(
        "CREATE TABLE products(id TEXT PRIMARY KEY,name TEXT NOT NULL,family TEXT NOT NULL,category TEXT NOT NULL,price_crc INTEGER NOT NULL,stock INTEGER NOT NULL,style_json TEXT NOT NULL,compatible_json TEXT NOT NULL,summary TEXT NOT NULL,variant_label TEXT,variants_json TEXT NOT NULL,visual TEXT NOT NULL,icon TEXT NOT NULL);"+
        "INSERT INTO products VALUES('acustica-luz','Old Guitar','Guitarra acústica','Instrumentos',12345,1,'[]','[]','Old','Color','[]','none','x');"+
        "CREATE TABLE orders(id TEXT PRIMARY KEY,tracking_hash TEXT NOT NULL UNIQUE,idempotency_key TEXT NOT NULL UNIQUE,status TEXT NOT NULL,fulfillment TEXT NOT NULL,total_crc INTEGER NOT NULL,created_at TEXT NOT NULL);"+
        "INSERT INTO orders VALUES('o1','hash','key','en preparación','retiro demo',24690,'2026-01-01');"+
        "CREATE TABLE order_lines(id INTEGER PRIMARY KEY,order_id TEXT NOT NULL,product_id TEXT NOT NULL,product_name TEXT NOT NULL,variant TEXT,quantity INTEGER NOT NULL,unit_price_crc INTEGER NOT NULL);"+
        "INSERT INTO order_lines VALUES(1,'o1','acustica-luz','Old Guitar','Natural',2,12345);"+
        "CREATE TABLE service_requests(id TEXT PRIMARY KEY,tracking_hash TEXT NOT NULL UNIQUE,type TEXT NOT NULL,description TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL);"+
        "INSERT INTO service_requests VALUES('s1','service-hash','afinación','demo','diagnóstico','2026-01-01');"
      ); db.close(); require(${JSON.stringify(resolve('.test-dist/lib/db.js'))});
    `;
    const result = spawnSync(process.execPath, ['-e', init], { encoding:'utf8', env:{ ...process.env, DIGARI_DB_PATH:file } });
    assert.equal(result.status, 0, result.stderr);
    const db = new DatabaseSync(file, { readOnly:true });
    const product = db.prepare('SELECT name,price_crc,stock FROM products WHERE id=?').get('acustica-luz') as { name:string;price_crc:number;stock:number };
    const order = db.prepare('SELECT status,total_crc FROM orders WHERE id=?').get('o1') as {status:string;total_crc:number};
    const line = db.prepare('SELECT product_name,unit_price_crc,quantity FROM order_lines WHERE id=1').get() as {product_name:string;unit_price_crc:number;quantity:number};
    const service = db.prepare('SELECT status FROM service_requests WHERE id=?').get('s1') as {status:string};
    assert.equal(product.name,'Yamaha F310 · guitarra acústica'); assert.equal(product.price_crc,84900); assert.equal(product.stock,8);
    assert.equal(order.status,'en preparación'); assert.equal(order.total_crc,24690);
    assert.equal(line.product_name,'Old Guitar'); assert.equal(line.unit_price_crc,12345); assert.equal(line.quantity,2); assert.equal(service.status,'diagnóstico');
    db.close();
  });
});
