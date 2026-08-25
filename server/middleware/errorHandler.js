function errorHandler(error, request, response, _next) {
  const status = error.statusCode || 500;
  if (status >= 500) console.error('Request failed', request.requestId, error);
  response.status(status).json({
    error: status === 500 ? 'Internal server error' : error.message,
    requestId: request.requestId,
  });
}

module.exports = { errorHandler };
