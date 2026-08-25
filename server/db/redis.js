const { createClient } = require('redis');
const { redisUrl } = require('../config/env');

function createRedisConnection() {
  const client = createClient({ url: redisUrl });
  client.on('error', (error) => console.error('Redis client error:', error.message));
  return client;
}

async function checkRedis(redis) {
  await redis.ping();
}

module.exports = { createRedisConnection, checkRedis };
