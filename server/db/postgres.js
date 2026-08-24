const { Pool } = require('pg');
const { database } = require('../config/env');

function createPostgresPool() {
  const options = database.connectionString
    ? { connectionString: database.connectionString, ssl: database.ssl }
    : {
        host: database.host,
        port: database.port,
        database: database.database,
        user: database.user,
        password: database.password,
        ssl: database.ssl,
      };

  return new Pool(options);
}

module.exports = { createPostgresPool };
