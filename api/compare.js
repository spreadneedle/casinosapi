const data = require('./bonus_enhanced');
const { requireApiKey } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireApiKey(req, res)) return;
  
  try {
    const casinoDataEnhanced = data.default || [];
    const { casinos: casinosParam } = req.query;
    
    if (!casinosParam) {
      return res.status(400).json({ error: '"casinos" parameter required' });
    }
    
    const slugs = casinosParam.split(',').map(s => s.trim().toLowerCase());
    const casinos = slugs.map(slug => 
      casinoDataEnhanced.find(c => c.slug === slug)
    ).filter(Boolean);
    
    if (casinos.length < 2) {
      return res.status(404).json({ error: 'Need at least 2 valid casinos' });
    }
    
    res.status(200).json({ casinos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
