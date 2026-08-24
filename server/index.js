const { createApp } = require('./app');
const { port, nodeEnv } = require('./config/env');

const app = createApp();

app.listen(port, () => {
  console.log(`IRCTC ReVamped server listening on http://localhost:${port} (${nodeEnv})`);
});
