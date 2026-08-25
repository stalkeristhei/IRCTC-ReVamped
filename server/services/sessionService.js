const crypto = require('node:crypto');

function sessionRedisKey(sessionId) {
  return `session:${sessionId}`;
}

function createSessionService({ pool, redis, ttlSeconds }) {
  async function create(account) {
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await pool.query('INSERT INTO sessions (id, account_id, expires_at) VALUES ($1, $2, $3)', [id, account.id, expiresAt]);
    await redis.set(sessionRedisKey(id), JSON.stringify({ accountId: account.id }), { EX: ttlSeconds });
    return { id, expiresAt };
  }

  async function getAccount(sessionId) {
    if (!sessionId) return null;
    const cached = await redis.get(sessionRedisKey(sessionId));
    if (!cached) return null;
    const { rows } = await pool.query(
      `SELECT a.id, a.login_id, a.role, a.status
       FROM sessions s JOIN accounts a ON a.id = s.account_id
       WHERE s.id = $1 AND s.revoked_at IS NULL AND s.expires_at > now()`,
      [sessionId],
    );
    if (!rows[0] || rows[0].status !== 'active') {
      await redis.del(sessionRedisKey(sessionId));
      return null;
    }
    await pool.query('UPDATE sessions SET last_seen_at = now() WHERE id = $1', [sessionId]);
    return rows[0];
  }

  async function revoke(sessionId) {
    if (!sessionId) return;
    await pool.query('UPDATE sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL', [sessionId]);
    await redis.del(sessionRedisKey(sessionId));
  }

  return { create, getAccount, revoke };
}

module.exports = { createSessionService };
