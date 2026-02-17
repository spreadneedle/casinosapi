// Health check endpoint - lightweight keep-alive
// GET /api/health

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Minimal response for fast cold-start wake
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    api_version: '2.0.0',
    uptime: 'healthy'
  });
};
