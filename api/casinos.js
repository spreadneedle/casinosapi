const data = require('./bonus_enhanced');
const { requireApiKey } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireApiKey(req, res)) return;

  try {
    const casinoDataEnhanced = data.default || [];
    const { healthy_only, limit = 200 } = req.query;

    let casinos = casinoDataEnhanced;

    if (healthy_only === 'true') {
      casinos = casinos.filter(c => !c.defunct && c.health_status?.status === 'ok');
    }

    casinos = casinos.slice(0, parseInt(limit));

    res.status(200).json({
      count: casinos.length,
      casinos: casinos
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
