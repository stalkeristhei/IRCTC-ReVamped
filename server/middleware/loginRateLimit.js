function createLoginRateLimit({ redis, maxAttempts = 5, windowSeconds = 15 * 60 }) {
  const keyFor = (request) => {
    const identity = String(request.body?.identity || '').trim().toLowerCase();
    return `login-rate:${request.ip}:${identity || 'empty'}`;
  };
  const middleware = async (request, response, next) => {
    const key = keyFor(request);
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    if (count > maxAttempts) {
      await redis.expire(key, windowSeconds);
      return response.status(429).json({ error: 'Too many login attempts. Please try again later.', requestId: request.requestId });
    }
    return next();
  };
  middleware.reset = async (request) => redis.del(keyFor(request));
  return middleware;
}

module.exports = { createLoginRateLimit };
