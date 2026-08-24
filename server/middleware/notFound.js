function apiNotFound(request, response) {
  response.status(404).json({
    error: 'Not found',
    path: request.originalUrl,
  });
}

module.exports = { apiNotFound };
