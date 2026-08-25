const { createApp } = require('./app');
const { createPostgresPool } = require('./db/postgres');
const { createRedisConnection } = require('./db/redis');
const { createSessionService } = require('./services/sessionService');
const { createAuthService } = require('./services/authService');
const { port, nodeEnv, cookieSecure, sessionTtlSeconds } = require('./config/env');

async function start() {
  const pool = createPostgresPool();
  const redis = createRedisConnection();
  await redis.connect();
  const sessionService = createSessionService({ pool, redis, ttlSeconds: sessionTtlSeconds });
  const authService = createAuthService({ pool, sessionService });
  const app = createApp({ pool, redis, authService, sessionService, cookieSecure, sessionTtlSeconds });
  const server = app.listen(port, () => console.log(`IRCTC ReVamped listening on http://localhost:${port} (${nodeEnv})`));
  const shutdown = async () => { server.close(); await redis.quit(); await pool.end(); };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

start().catch((error) => { console.error('Unable to start server:', error.message); process.exitCode = 1; });
