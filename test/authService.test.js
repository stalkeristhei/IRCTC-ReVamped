const test = require('node:test');
const assert = require('node:assert/strict');
const argon2 = require('argon2');
const { createAuthService } = require('../server/services/authService');

function account(overrides = {}) {
  return {
    id: '00000000-0000-4000-8000-000000000001', login_id: 'passenger.demo', role: 'user', status: 'active',
    authorization_status: null, authorization_expires_at: null, ...overrides,
  };
}

async function makeService(row) {
  const events = [];
  const pool = {
    async query(sql, values) {
      if (sql.includes('FROM accounts')) return { rows: row ? [row] : [] };
      if (sql.includes('INSERT INTO audit_events')) { events.push(values); return { rows: [] }; }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const sessions = [];
  const service = createAuthService({ pool, sessionService: { async create(value) { sessions.push(value); return { id: 'session-id' }; } } });
  return { service, events, sessions };
}

test('authenticates an active user with valid credentials', async () => {
  const passwordHash = await argon2.hash('PassengerDemo!123', { type: argon2.argon2id });
  const { service, sessions } = await makeService(account({ password_hash: passwordHash }));
  const result = await service.login({ identity: 'PASSENGER.DEMO', password: 'PassengerDemo!123', requestedRole: 'user', requestId: crypto.randomUUID() });
  assert.deepEqual(result.account, { id: account().id, name: 'passenger.demo', role: 'user' });
  assert.equal(sessions.length, 1);
});

test('uses one generic error for invalid credentials and inactive accounts', async () => {
  const hash = await argon2.hash('PassengerDemo!123', { type: argon2.argon2id });
  for (const row of [null, account({ password_hash: hash, status: 'disabled' }), account({ password_hash: hash })]) {
    const { service } = await makeService(row);
    await assert.rejects(
      service.login({ identity: 'passenger.demo', password: row ? (row.status === 'disabled' ? 'PassengerDemo!123' : 'wrong-password') : 'wrong-password', requestedRole: 'user', requestId: crypto.randomUUID() }),
      { message: 'Invalid credentials or account access.', statusCode: 401 },
    );
  }
});

test('requires server-side agent authorization and declaration', async () => {
  const hash = await argon2.hash('AgentDemo!123', { type: argon2.argon2id });
  const activeAgent = account({ login_id: 'agent.demo', role: 'agent', password_hash: hash, authorization_status: 'active', authorization_expires_at: new Date(Date.now() + 86400000).toISOString() });
  const { service, events } = await makeService(activeAgent);
  await assert.rejects(service.login({ identity: 'agent.demo', password: 'AgentDemo!123', requestedRole: 'agent', agentDeclarationAccepted: false, requestId: crypto.randomUUID() }), { statusCode: 401 });
  await service.login({ identity: 'agent.demo', password: 'AgentDemo!123', requestedRole: 'agent', agentDeclarationAccepted: true, requestId: crypto.randomUUID() });
  assert.equal(events.some((event) => event[2] === 'auth.agent_declaration_accepted'), true);

  const expired = account({ ...activeAgent, authorization_status: 'expired', authorization_expires_at: new Date(Date.now() - 86400000).toISOString() });
  const expiredService = await makeService(expired);
  await assert.rejects(expiredService.service.login({ identity: 'agent.demo', password: 'AgentDemo!123', requestedRole: 'agent', agentDeclarationAccepted: true, requestId: crypto.randomUUID() }), { statusCode: 401 });
});

test('does not grant agent privilege from a client requested role', async () => {
  const hash = await argon2.hash('PassengerDemo!123', { type: argon2.argon2id });
  const { service } = await makeService(account({ password_hash: hash, role: 'user' }));
  await assert.rejects(service.login({ identity: 'passenger.demo', password: 'PassengerDemo!123', requestedRole: 'agent', agentDeclarationAccepted: true, requestId: crypto.randomUUID() }), { statusCode: 401 });
});
