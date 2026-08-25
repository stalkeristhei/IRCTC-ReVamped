const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: positiveInteger(process.env.PORT, 3000),
  sessionTtlSeconds: positiveInteger(process.env.SESSION_TTL_SECONDS, 8 * 60 * 60),
  cookieSecure: process.env.COOKIE_SECURE === 'true' || nodeEnv === 'production',
  database: {
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: positiveInteger(process.env.POSTGRES_PORT, 5432),
    database: process.env.POSTGRES_DB || 'irctc_revamped',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || undefined,
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};
