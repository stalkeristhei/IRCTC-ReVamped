const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { requestId } = require('./middleware/requestId');
const { errorHandler } = require('./middleware/errorHandler');
const { apiNotFound } = require('./middleware/notFound');
const { createHealthRouter } = require('./routes/health');
const { createAuthRouter } = require('./routes/auth');

const frontendRoot = path.resolve(__dirname, '..');

function createApp(dependencies) {
  const { pool, redis, authService, sessionService, cookieSecure, sessionTtlSeconds } = dependencies;
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '16kb' }));
  app.use(requestId);
  app.use('/api/health', createHealthRouter({ pool, redis }));
  app.use('/v1/auth', createAuthRouter({ authService, sessionService, pool, redis, cookieSecure, sessionTtlSeconds }));
  app.use('/api', apiNotFound);
  app.use('/css', express.static(path.join(frontendRoot, 'css')));
  app.use('/js', express.static(path.join(frontendRoot, 'js')));
  app.get(/^\/irctc-bg(?:-silhouette)?\.png$/i, (request, response) => response.sendFile(path.join(frontendRoot, path.basename(request.path))));
  app.get(['/', '/index.html'], (_request, response) => response.sendFile(path.join(frontendRoot, 'index.html')));
  app.get(/^\/([a-z0-9-]+)\.html$/i, (request, response, next) => {
    const filepath = path.join(frontendRoot, `${request.params[0]}.html`);
    return fs.existsSync(filepath) ? response.sendFile(filepath) : next();
  });
  app.use((_request, response) => response.status(404).send('Not found'));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
