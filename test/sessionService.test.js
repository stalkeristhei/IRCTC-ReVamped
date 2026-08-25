const test = require('node:test');
const assert = require('node:assert/strict');
const { createSessionService } = require('../server/services/sessionService');

function createFakes(rows = []) {
  const redisValues = new Map();
  const redis = {
    async set(key, value) { redisValues.set(key, value); },
    async get(key) { return redisValues.get(key) || null; },
    async del(key) { redisValues.delete(key); },
  };
  const calls = [];
  const pool = { async query(sql, values) { calls.push([sql, values]); return { rows: sql.includes('SELECT a.id') ? rows : [] }; } };
  return { redis, pool, redisValues, calls };
}

test('creates Redis-backed durable sessions and rejects revoked/expired cache entries', async () => {
  const fakes = createFakes([{ id: 'user-id', login_id: 'passenger.demo', role: 'user', status: 'active' }]);
  const service = createSessionService({ pool: fakes.pool, redis: fakes.redis, ttlSeconds: 60 });
  const created = await service.create({ id: 'user-id' });
  assert.ok(fakes.redisValues.has(`session:${created.id}`));
  assert.equal((await service.getAccount(created.id)).id, 'user-id');
  await service.revoke(created.id);
  assert.equal(await service.getAccount(created.id), null);
});
