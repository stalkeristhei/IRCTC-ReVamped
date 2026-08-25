function validateLoginBody(request, response, next) {
  const { identity, password, role, agentDeclarationAccepted } = request.body || {};
  const valid = typeof identity === 'string' && identity.trim().length > 0 && identity.trim().length <= 80
    && typeof password === 'string' && password.length >= 8 && password.length <= 256
    && (role === 'user' || role === 'agent')
    && (agentDeclarationAccepted === undefined || typeof agentDeclarationAccepted === 'boolean');
  if (!valid) return response.status(400).json({ error: 'Invalid login request.', requestId: request.requestId });
  return next();
}

module.exports = { validateLoginBody };
