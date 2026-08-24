const express = require('express');
const { getHealthStatus } = require('../services/healthService');

const router = express.Router();

router.get('/', (_request, response) => {
  response.json(getHealthStatus());
});

module.exports = router;
