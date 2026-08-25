const express = require('express');

function createHealthRouter({ pool, redis }) {
  const router = express.Router();
  router.get('/', (_request, response) => response.json({ status: 'ok', service: 'irctc-revamped', timestamp: new Date().toISOString() }));
  router.get('/ready', async (_request, response) => {
    try {
      await pool.query('SELECT 1');
      await redis.ping();
      response.json({ status: 'ready' });
    } catch (_error) {
      response.status(503).json({ status: 'not_ready' });
    }
  });
  return router;
}

module.exports = { createHealthRouter };
