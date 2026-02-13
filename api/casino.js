// Single Casino Detail API
// GET /api/casino/:slug   or   /api/casino?name=caZeus

const { casinoDataEnhanced } = require('./bonus_enhanced');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { name, slug } = req.query;
  
  if (!name && !slug) {
    return res.status(400).json({
      error: 'Either "name" or "slug" parameter required',
      examples: [
        '/api/casino?slug=cazeus',
        '/api/casino?name=CaZeus Casino'
      ]
    });
  }
  
  let casino;
  
  if (slug) {
    casino = casinoDataEnhanced.find(c => c.slug === slug.toLowerCase());
  } else {
    // Try exact match first, then partial
    const searchName = name.toLowerCase();
    casino = casinoDataEnhanced.find(c => 
      c.casino_name.toLowerCase() === searchName ||
      c.slug === searchName.replace(/\s+/g, '-')
    );
    
    // Partial match fallback
    if (!casino) {
      casino = casinoDataEnhanced.find(c => 
        c.casino_name.toLowerCase().includes(searchName)
      );
    }
  }
  
  if (!casino) {
    return res.status(404).json({
      error: 'Casino not found',
      searched: { name, slug },
      suggestion: 'Use /api/search?q=' + (name || slug) + ' to find similar casinos'
    });
  }
  
  // Get similar casinos
  const similar = casinoDataEnhanced
    .filter(c => {
      if (c.slug === casino.slug) return false;
      // Match by similar bonus type or percentage
      const sameType = c.bonus_structure.percentage === casino.bonus_structure.percentage;
      const similarAmount = c.bonus_structure.max_amount && casino.bonus_structure.max_amount &&
        Math.abs(c.bonus_structure.max_amount - casino.bonus_structure.max_amount) < 500;
      return sameType || similarAmount;
    })
    .slice(0, 3);
  
  res.status(200).json({
    casino: casino,
    similar_casinos: similar,
    api_version: '2.0.0',
    _links: {
      search: '/api/search?q=' + encodeURIComponent(casino.casino_name),
      compare: '/api/compare?casinos=' + casino.slug
    }
  });
};
