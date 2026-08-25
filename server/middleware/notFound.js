function apiNotFound(request, response) {
  response.status(404).json({ error: 'Not found', requestId: request.requestId });
}

module.exports = { apiNotFound };
