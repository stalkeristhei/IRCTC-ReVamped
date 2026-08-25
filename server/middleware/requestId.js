const crypto = require('node:crypto');

function requestId(request, response, next) {
  const supplied = request.get('X-Request-Id');
  request.requestId = /^[0-9a-f-]{36}$/i.test(supplied || '') ? supplied : crypto.randomUUID();
  response.set('X-Request-Id', request.requestId);
  next();
}

module.exports = { requestId };
