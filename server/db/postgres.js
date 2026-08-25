const { Pool } = require('pg');
const { database } = require('../config/env');

function createPostgresPool() {
  const options = database.connectionString
    ? { connectionString: database.connectionString, ssl: database.ssl }
    : database;
  return new Pool(options);
}

async function checkPostgres(pool) {
  await pool.query('SELECT 1');
}

module.exports = { createPostgresPool, checkPostgres };
