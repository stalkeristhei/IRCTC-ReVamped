const express = require('express');
const { validateLoginBody } = require('../validation/auth');
const { createLoginRateLimit } = require('../middleware/loginRateLimit');
const { createAuthenticateSession } = require('../middleware/authenticateSession');
const { recordAuditEvent } = require('../services/auditService');

function cookieOptions({ secure, ttlSeconds }) {
  return { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: ttlSeconds * 1000 };
}

function createAuthRouter({ authService, sessionService, pool, redis, cookieSecure, sessionTtlSeconds }) {
  const router = express.Router();
  const authenticateSession = createAuthenticateSession({ sessionService });
  const options = cookieOptions({ secure: cookieSecure, ttlSeconds: sessionTtlSeconds });
  const loginRateLimit = createLoginRateLimit({ redis });

  router.post('/login', validateLoginBody, loginRateLimit, async (request, response, next) => {
    try {
      const result = await authService.login({
        identity: request.body.identity,
        password: request.body.password,
        requestedRole: request.body.role,
        agentDeclarationAccepted: request.body.agentDeclarationAccepted === true,
        requestId: request.requestId,
      });
      await loginRateLimit.reset(request);
      response.cookie('irctc_session', result.session.id, options);
      response.status(200).json({ account: result.account });
    } catch (error) { next(error); }
  });

  router.get('/session', authenticateSession, (request, response) => {
    response.json({ account: authService.publicAccount(request.account) });
  });

  router.post('/logout', authenticateSession, async (request, response, next) => {
    try {
      await sessionService.revoke(request.sessionId);
      await recordAuditEvent(pool, { accountId: request.account.id, requestId: request.requestId, eventType: 'auth.logout', metadata: {} });
      response.clearCookie('irctc_session', { httpOnly: true, secure: cookieSecure, sameSite: 'lax', path: '/' });
      response.status(204).end();
    } catch (error) { next(error); }
  });
  return router;
}

module.exports = { createAuthRouter };
