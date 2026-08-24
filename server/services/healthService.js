function getHealthStatus() {
  return {
    status: 'ok',
    service: 'irctc-revamped',
    timestamp: new Date().toISOString(),
  };
}

module.exports = { getHealthStatus };
