function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter(([key]) => key));
}

function createAuthenticateSession({ sessionService }) {
  return async (request, response, next) => {
    const sessionId = parseCookies(request.headers.cookie).irctc_session;
    try {
      const account = await sessionService.getAccount(sessionId);
      if (!account) return response.status(401).json({ error: 'Unauthenticated', requestId: request.requestId });
      request.sessionId = sessionId;
      request.account = account;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { createAuthenticateSession, parseCookies };
