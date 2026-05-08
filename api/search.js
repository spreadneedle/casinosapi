const data = require('./bonus_enhanced');
const { requireApiKey } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireApiKey(req, res)) return;
  
  try {
    const casinoDataEnhanced = data.default || [];
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const searchQ = q.toLowerCase();
    let results = casinoDataEnhanced.filter(c => {
      return (c.casino_name && c.casino_name.toLowerCase().includes(searchQ)) ||
             (c.ai_summary && c.ai_summary.toLowerCase().includes(searchQ)) ||
             (c.bonus && c.bonus.toLowerCase().includes(searchQ));
    });
    
    // If no direct matches, try broader search
    if (results.length === 0) {
      results = casinoDataEnhanced.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      query: q,
      count: results.length,
      casinos: results.slice(0, parseInt(limit))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
