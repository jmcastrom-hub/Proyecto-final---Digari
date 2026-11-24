import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Tests use a throwaway SQLite file; they never open or reset the user's project database.
const temp = mkdtempSync(join(tmpdir(), 'digari-tests-'));
try {
  const result = spawnSync(process.execPath, ['--test', '.test-dist/tests/orders.test.js', '.test-dist/tests/models.test.js', '.test-dist/tests/advisor.test.js', '.test-dist/tests/audio-profiles.test.js', '.test-dist/tests/catalog-migration.test.js'], {
    stdio: 'inherit', env: { ...process.env, DIGARI_DB_PATH: join(temp, 'test.sqlite') },
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally { rmSync(temp, { recursive: true, force: true }); }
