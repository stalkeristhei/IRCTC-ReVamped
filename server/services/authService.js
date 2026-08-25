const argon2 = require('argon2');
const { recordAuditEvent } = require('./auditService');

const GENERIC_AUTH_ERROR = 'Invalid credentials or account access.';
const AGENT_DECLARATION_VERSION = '2026-08-25';

function publicAccount(account) {
  return { id: account.id, name: account.login_id, role: account.role };
}

function createAuthService({ pool, sessionService }) {
  async function login({ identity, password, requestedRole, agentDeclarationAccepted, requestId }) {
    const normalizedIdentity = identity.trim().toLowerCase();
    const { rows } = await pool.query(
      `SELECT a.id, a.login_id, a.role, a.status, a.password_hash,
              ap.authorization_status, ap.authorization_expires_at
       FROM accounts a
       LEFT JOIN agent_profiles ap ON ap.account_id = a.id
       WHERE lower(a.login_id) = $1 OR lower(a.email) = $1
       LIMIT 1`,
      [normalizedIdentity],
    );
    const account = rows[0];
    const validPassword = account ? await argon2.verify(account.password_hash, password) : false;
    const agentAuthorized = account && account.role === 'agent'
      && account.authorization_status === 'active'
      && new Date(account.authorization_expires_at) > new Date();
    const allowed = account && validPassword && account.status === 'active'
      && account.role === requestedRole
      && (requestedRole !== 'agent' || (agentDeclarationAccepted && agentAuthorized));

    if (!allowed) {
      await recordAuditEvent(pool, {
        accountId: account?.id,
        requestId,
        eventType: 'auth.login_failed',
        metadata: { requestedRole },
      });
      const error = new Error(GENERIC_AUTH_ERROR);
      error.statusCode = 401;
      throw error;
    }

    const session = await sessionService.create(account);
    await recordAuditEvent(pool, {
      accountId: account.id,
      requestId,
      eventType: 'auth.login_succeeded',
      metadata: { role: account.role },
    });
    if (account.role === 'agent') {
      await recordAuditEvent(pool, {
        accountId: account.id,
        requestId,
        eventType: 'auth.agent_declaration_accepted',
        metadata: { version: AGENT_DECLARATION_VERSION, acceptedAt: new Date().toISOString() },
      });
    }
    return { session, account: publicAccount(account) };
  }

  return { login, publicAccount };
}

module.exports = { createAuthService, GENERIC_AUTH_ERROR };
