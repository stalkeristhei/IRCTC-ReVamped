const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');

function createTestServer() {
  const redisCounts = new Map();
  const redis = {
    async ping() { return 'PONG'; },
    async incr(key) { const value = (redisCounts.get(key) || 0) + 1; redisCounts.set(key, value); return value; },
    async expire() {},
    async del(key) { redisCounts.delete(key); },
  };
  const account = { id: 'account-id', login_id: 'passenger.demo', role: 'user', status: 'active' };
  let activeSession = 'session-id';
  const sessionService = {
    async getAccount(sessionId) { return sessionId === activeSession ? account : null; },
    async revoke(sessionId) { if (sessionId === activeSession) activeSession = null; },
  };
  const pool = { async query() { return { rows: [] }; } };
  const authService = {
    publicAccount(value) { return { id: value.id, name: value.login_id, role: value.role }; },
    async login({ identity, requestedRole }) {
      if (identity !== 'passenger.demo' || requestedRole !== 'user') {
        const error = new Error('Invalid credentials or account access.');
        error.statusCode = 401;
        throw error;
      }
      return { session: { id: activeSession }, account: this.publicAccount(account) };
    },
  };
  return createApp({ pool, redis, authService, sessionService, cookieSecure: false, sessionTtlSeconds: 60 });
}

async function withServer(callback) {
  const server = createTestServer().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try { await callback(`http://127.0.0.1:${server.address().port}`); } finally { await new Promise((resolve) => server.close(resolve)); }
}

test('serves the existing frontend and authenticates, reads, and revokes a session', async () => {
  await withServer(async (baseUrl) => {
    const home = await fetch(`${baseUrl}/`);
    const asset = await fetch(`${baseUrl}/irctc-bg.png`);
    const health = await fetch(`${baseUrl}/api/health`);
    assert.equal(home.status, 200);
    assert.equal(asset.status, 200);
    assert.equal(health.status, 200);

    const login = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'passenger.demo', password: 'PassengerDemo!123', role: 'user' }),
    });
    assert.equal(login.status, 200);
    assert.match(login.headers.get('set-cookie'), /HttpOnly/);
    assert.ok(login.headers.get('x-request-id'));
    const cookie = login.headers.get('set-cookie').split(';')[0];

    const session = await fetch(`${baseUrl}/v1/auth/session`, { headers: { Cookie: cookie } });
    assert.equal(session.status, 200);
    assert.equal((await session.json()).account.role, 'user');

    const logout = await fetch(`${baseUrl}/v1/auth/logout`, { method: 'POST', headers: { Cookie: cookie } });
    assert.equal(logout.status, 204);
    const revoked = await fetch(`${baseUrl}/v1/auth/session`, { headers: { Cookie: cookie } });
    assert.equal(revoked.status, 401);
  });
});

test('rate limits repeated login attempts in Redis-backed middleware', async () => {
  await withServer(async (baseUrl) => {
    const options = {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'attacker', password: 'password-long-enough', role: 'user' }),
    };
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await fetch(`${baseUrl}/v1/auth/login`, options);
      assert.equal(response.status, 401);
    }
    const limited = await fetch(`${baseUrl}/v1/auth/login`, options);
    assert.equal(limited.status, 429);
  });
});
