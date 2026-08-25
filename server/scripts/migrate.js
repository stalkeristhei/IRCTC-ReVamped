const fs = require('node:fs/promises');
const path = require('node:path');
const { createPostgresPool } = require('../db/postgres');

async function migrate() {
  const pool = createPostgresPool();
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    const migrationsPath = path.resolve(__dirname, '../db/migrations');
    const migrations = (await fs.readdir(migrationsPath)).filter((name) => name.endsWith('.sql')).sort();
    for (const name of migrations) {
      const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
      if (applied.rowCount) continue;
      await pool.query('BEGIN');
      try {
        await pool.query(await fs.readFile(path.join(migrationsPath, name), 'utf8'));
        await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
        await pool.query('COMMIT');
        console.log(`Applied ${name}`);
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
});
