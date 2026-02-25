// API Key Authentication Helper
// Checks X-API-Key header or ?key= query parameter
// Returns true if authorized, false if rejected (and sends 401 response)

const API_KEY = 'grokcasino-api-key-2026-02-24-abcdef123456';

function requireApiKey(req, res) {
  const headerKey = req.headers['x-api-key'];
  const queryKey = req.query.key;

  if (headerKey === API_KEY || queryKey === API_KEY) {
    return true;
  }

  res.status(401).json({
    error: 'Unauthorized',
    message: 'Valid API key required. Provide via X-API-Key header or ?key= query parameter.'
  });
  return false;
}

module.exports = { requireApiKey };
