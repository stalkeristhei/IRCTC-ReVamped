const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function numberFromEnv(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: numberFromEnv(process.env.PORT, 3000),
  database: {
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: numberFromEnv(process.env.POSTGRES_PORT, 5432),
    database: process.env.POSTGRES_DB || 'irctc_revamped',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || undefined,
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};
