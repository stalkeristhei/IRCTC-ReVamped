const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const healthRouter = require('./routes/health');
const { apiNotFound } = require('./middleware/notFound');

const frontendRoot = path.resolve(__dirname, '..');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api', apiNotFound);

  // Keep the prototype's existing relative CSS and JavaScript URLs unchanged.
  app.use('/css', express.static(path.join(frontendRoot, 'css')));
  app.use('/js', express.static(path.join(frontendRoot, 'js')));

  app.get(['/', '/index.html'], (_request, response) => {
    response.sendFile(path.join(frontendRoot, 'index.html'));
  });

  app.get(/^\/([a-z0-9-]+)\.html$/i, (request, response, next) => {
    const filename = `${request.params[0]}.html`;
    const filepath = path.join(frontendRoot, filename);

    if (!fs.existsSync(filepath)) return next();
    return response.sendFile(filepath);
  });

  app.use((_request, response) => {
    response.status(404).send('Not found');
  });

  return app;
}

module.exports = { createApp };
