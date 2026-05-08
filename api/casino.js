const data = require('./bonus_enhanced');
const { requireApiKey } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireApiKey(req, res)) return;
  
  try {
    const casinoDataEnhanced = data.default || data.casinoDataEnhanced || [];
    const { name, slug } = req.query;
    
    if (!name && !slug) {
      return res.status(400).json({ error: 'Either "name" or "slug" parameter required' });
    }
    
    let casino;
    
    if (slug) {
      casino = casinoDataEnhanced.find(c => c.slug === slug.toLowerCase());
    } else {
      const searchName = name.toLowerCase();
      casino = casinoDataEnhanced.find(c => 
        c.casino_name.toLowerCase() === searchName
      );
    }
    
    if (!casino) {
      return res.status(404).json({ error: 'Casino not found', searched: { name, slug } });
    }
    
    res.status(200).json({ casino });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack.split('\n').slice(0, 5) });
  }
};
