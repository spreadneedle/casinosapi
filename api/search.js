// AI-Powered Casino Search API Endpoint
// GET /api/search?q=200% bonus&location=FI&limit=10

const { casinoDataEnhanced } = require('./bonus_enhanced');

// License mapping for location filtering
const casinoLicenses = [
  { id: 1, name: "Malta Gaming Authority", validCountries: ["MT", "CA", "FI", "NO", "JP", "IN", "NZ", "BR", "DE", "FR", "ES", "IT", "NL", "BE", "AT", "CH", "IE", "AU", "ZA"] },
  { id: 2, name: "Curaçao eGaming", validCountries: ["CW", "CA", "FI", "NO", "JP", "IN", "NZ", "BR", "MX", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "PL", "PT", "RO", "SK", "SI", "SE"] },
  { id: 31, name: "Estonian Tax and Customs Board", validCountries: ["EE", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"] },
  { id: 54, name: "Anjouan Gaming", validCountries: ["IN", "BR", "MX", "ZA", "FI", "NO", "NZ", "JP", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "PL", "PT", "RO", "SK", "SI", "SE"] },
];

function parseQuery(q) {
  const params = {
    percentage: null,
    minAmount: null,
    maxAmount: null,
    hasFreeSpins: null,
    noWagerSpins: false,
    currency: null,
    license: null,
    keywords: []
  };
  
  const lowerQ = q.toLowerCase();
  
  // Parse percentage
  const percentMatch = lowerQ.match(/(\d+)\s*(?:%|percent)/);
  if (percentMatch) params.percentage = parseInt(percentMatch[1]);
  
  // Parse amounts
  const underMatch = lowerQ.match(/(?:under|less than|max)\s*[€$]?(\d+)/);
  if (underMatch) params.maxAmount = parseInt(underMatch[1]);
  
  const overMatch = lowerQ.match(/(?:over|more than|min)\s*[€$]?(\d+)/);
  if (overMatch) params.minAmount = parseInt(overMatch[1]);
  
  const rangeMatch = lowerQ.match(/[€$]?(\d+)\s*(?:-|to)\s*[€$]?(\d+)/);
  if (rangeMatch) {
    params.minAmount = parseInt(rangeMatch[1]);
    params.maxAmount = parseInt(rangeMatch[2]);
  }
  
  // Free spins
  if (lowerQ.includes('free spin') || lowerQ.includes('freespin')) {
    params.hasFreeSpins = true;
  }
  if (lowerQ.includes('no wagering') || lowerQ.includes('zero wagering') || lowerQ.includes('0x')) {
    params.noWagerSpins = true;
  }
  
  // Keywords
  const words = lowerQ.split(/\s+/).filter(w => w.length > 2);
  params.keywords = words.map(w => w.replace(/[.,!?;:]$/, ''));
  
  return params;
}

function scoreCasino(casino, params) {
  let score = 0;
  let matches = [];
  
  const bs = casino.bonus_structure;
  const w = casino.wagering;
  
  // Percentage match (highest priority)
  if (params.percentage) {
    if (bs.percentage === params.percentage) {
      score += 50;
      matches.push(`Exact ${params.percentage}% match`);
    } else if (bs.percentage && Math.abs(bs.percentage - params.percentage) <= 50) {
      score += 30;
      matches.push(`Close percentage (${bs.percentage}%)`);
    }
  }
  
  // Amount range
  if (params.minAmount && bs.max_amount >= params.minAmount) {
    score += 20;
    matches.push(`Amount >= €${params.minAmount}`);
  }
  if (params.maxAmount && bs.max_amount && bs.max_amount <= params.maxAmount) {
    score += 20;
    matches.push(`Amount <= €${params.maxAmount}`);
  }
  
  // Free spins
  if (params.hasFreeSpins && bs.free_spins > 0) {
    score += 25;
    matches.push(`${bs.free_spins} free spins`);
  }
  
  // No wagering
  if (params.noWagerSpins && w.free_spins && 
      (w.free_spins.includes('0x') || w.free_spins.includes('no wagering'))) {
    score += 40;
    matches.push('No wagering on spins');
  }
  
  // Keywords
  params.keywords.forEach(kw => {
    if (casino.casino_name.toLowerCase().includes(kw) || 
        casino.ai_summary.toLowerCase().includes(kw)) {
      score += 10;
    }
  });
  
  return { score, matches };
}

module.exports = function handler(req, res) {
  const startTime = Date.now();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { q, location, limit = 20 } = req.query;
  
  if (!q) {
    return res.status(400).json({ 
      error: 'Query parameter "q" is required',
      example: '/api/search?q=200% bonus&location=FI'
    });
  }
  
  const params = parseQuery(q);
  
  let results = casinoDataEnhanced.map(casino => {
    const { score, matches } = scoreCasino(casino, params);
    return {
      ...casino,
      relevance_score: score,
      match_reasons: matches
    };
  });
  
  // Sort by relevance
  results.sort((a, b) => b.relevance_score - a.relevance_score);
  
  // Filter by location if specified
  if (location) {
    const locUpper = location.toUpperCase();
    const validLicenseIds = casinoLicenses
      .filter(l => l.validCountries && l.validCountries.includes(locUpper))
      .map(l => l.id);
    
    results = results.filter(c => 
      c.licenses && c.licenses.some(l => validLicenseIds.includes(l))
    );
  }
  
  // Apply relevance threshold
  const highRelevance = results.filter(r => r.relevance_score > 20);
  if (highRelevance.length > 0) results = highRelevance;
  
  const limitedResults = results.slice(0, parseInt(limit));
  
  const processingTime = Date.now() - startTime;
  
  res.status(200).json({
    meta: {
      query: q,
      query_parsed: params,
      location: location || null,
      total_results: results.length,
      returned: limitedResults.length,
      has_more: results.length > limitedResults.length,
      processing_ms: processingTime
    },
    casinos: limitedResults
  });
};

// Also export for testing
module.exports.parseQuery = parseQuery;
module.exports.scoreCasino = scoreCasino;
