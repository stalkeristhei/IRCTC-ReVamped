const { createApp } = require('../server/app');
const { createPostgresPool } = require('../server/db/postgres');
const { createRedisConnection } = require('../server/db/redis');
const { createSessionService } = require('../server/services/sessionService');
const { createAuthService } = require('../server/services/authService');
const { cookieSecure, sessionTtlSeconds } = require('../server/config/env');

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const pool = createPostgresPool();
      const redis = createRedisConnection();
      await redis.connect();
      const sessionService = createSessionService({ pool, redis, ttlSeconds: sessionTtlSeconds });
      const authService = createAuthService({ pool, sessionService });
      return createApp({ pool, redis, authService, sessionService, cookieSecure, sessionTtlSeconds });
    })().catch((error) => {
      appPromise = undefined;
      throw error;
    });
  }
  return appPromise;
}

module.exports = async function handler(request, response) {
  try {
    const app = await getApp();
    return app(request, response);
  } catch (error) {
    console.error('Unable to initialize Vercel application:', error.message);
    return response.status(503).json({ error: 'Service unavailable' });
  }
};

