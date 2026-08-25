const argon2 = require('argon2');
const { createPostgresPool } = require('../db/postgres');
const { nodeEnv } = require('../config/env');

async function upsertAccount(pool, { loginId, email, role, password, status = 'active' }) {
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const { rows } = await pool.query(
    `INSERT INTO accounts (login_id, email, role, password_hash, status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (login_id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role,
       password_hash = EXCLUDED.password_hash, status = EXCLUDED.status, updated_at = now()
     RETURNING id`,
    [loginId, email, role, passwordHash, status],
  );
  return rows[0].id;
}

async function seed() {
  if (nodeEnv === 'production') throw new Error('Development seed is disabled in production.');
  const userPassword = process.env.SEED_USER_PASSWORD || 'PassengerDemo!123';
  const agentPassword = process.env.SEED_AGENT_PASSWORD || 'AgentDemo!123';
  const pool = createPostgresPool();
  try {
    await pool.query('BEGIN');
    await upsertAccount(pool, { loginId: 'passenger.demo', email: 'passenger@example.test', role: 'user', password: userPassword });
    const agentId = await upsertAccount(pool, { loginId: 'agent.demo', email: 'agent@example.test', role: 'agent', password: agentPassword });
    const expiredId = await upsertAccount(pool, { loginId: 'agent.expired', email: 'expired-agent@example.test', role: 'agent', password: agentPassword });
    await pool.query(
      `INSERT INTO agent_profiles (account_id, agent_user_id, authorization_status, authorization_expires_at, audit_reference)
       VALUES ($1, 'AGENT-DEMO-001', 'active', now() + interval '365 days', 'development-seed')
       ON CONFLICT (account_id) DO UPDATE SET authorization_status = EXCLUDED.authorization_status,
         authorization_expires_at = EXCLUDED.authorization_expires_at, audit_reference = EXCLUDED.audit_reference, updated_at = now()`,
      [agentId],
    );
    await pool.query(
      `INSERT INTO agent_profiles (account_id, agent_user_id, authorization_status, authorization_expires_at, audit_reference)
       VALUES ($1, 'AGENT-EXPIRED-001', 'expired', now() - interval '1 day', 'development-seed')
       ON CONFLICT (account_id) DO UPDATE SET authorization_status = EXCLUDED.authorization_status,
         authorization_expires_at = EXCLUDED.authorization_expires_at, audit_reference = EXCLUDED.audit_reference, updated_at = now()`,
      [expiredId],
    );
    await pool.query('COMMIT');
    console.log('Development accounts seeded: passenger.demo, agent.demo, agent.expired');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
});
