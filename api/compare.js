// Casino Comparison API
// GET /api/compare?casinos=cazeus,dynabet,betrz

const { casinoDataEnhanced } = require('./bonus_enhanced');

function getNumericWagering(wageringStr) {
  if (!wageringStr || wageringStr === 'n/a') return 999;
  const match = wageringStr.toString().match(/(\d+)/);
  return match ? parseInt(match[1]) : 999;
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { casinos: casinosParam } = req.query;
  
  if (!casinosParam) {
    return res.status(400).json({
      error: '"casinos" parameter required (comma-separated slugs)',
      example: '/api/compare?casinos=cazeus,dynabet'
    });
  }
  
  const slugs = casinosParam.split(',').map(s => s.trim().toLowerCase());
  
  if (slugs.length < 2) {
    return res.status(400).json({
      error: 'At least 2 casinos required for comparison',
      provided: slugs.length
    });
  }
  
  const casinos = slugs.map(slug => 
    casinoDataEnhanced.find(c => c.slug === slug)
  ).filter(Boolean);
  
  const notFound = slugs.filter(slug => 
    !casinoDataEnhanced.find(c => c.slug === slug)
  );
  
  if (casinos.length < 2) {
    return res.status(404).json({
      error: 'Not enough valid casinos found',
      requested: slugs,
      found: casinos.length,
      not_found: notFound,
      available_slugs: casinos.map(c => c.slug)
    });
  }
  
  // Calculate comparisons
  const comparison = {
    bonus_comparison: {
      highest_percentage: casinos.reduce((a, b) => 
        (a.bonus_structure.percentage || 0) > (b.bonus_structure.percentage || 0) ? a : b
      ),
      highest_amount: casinos.reduce((a, b) =>
        (a.bonus_structure.max_amount || 0) > (b.bonus_structure.max_amount || 0) ? a : b
      ),
      most_free_spins: casinos.reduce((a, b) =>
        (a.bonus_structure.free_spins || 0) > (b.bonus_structure.free_spins || 0) ? a : b
      )
    },
    wagering_comparison: {
      lowest_bonus_wagering: [...casinos].sort((a, b) => 
        getNumericWagering(a.wagering.bonus) - getNumericWagering(b.wagering.bonus)
      )[0],
      lowest_fs_wagering: [...casinos].sort((a, b) =>
        getNumericWagering(a.wagering.free_spins) - getNumericWagering(b.wagering.free_spins)
      )[0]
    },
    trust_comparison: {
      highest_trust: casinos.reduce((a, b) => a.trust.score > b.trust.score ? a : b),
      lowest_trust: casinos.reduce((a, b) => a.trust.score < b.trust.score ? a : b)
    },
    verification_comparison: {
      most_recently_verified: [...casinos].sort((a, b) => 
        new Date(b.verification.last_verified) - new Date(a.verification.last_verified)
      )[0],
      highest_confidence: casinos.reduce((a, b) => 
        ['high', 'medium', 'low'].indexOf(a.verification.confidence) < 
        ['high', 'medium', 'low'].indexOf(b.verification.confidence) ? a : b
      )
    }
  };
  
  // Generate AI recommendation
  let recommendation = '';
  const bestBonus = comparison.bonus_comparison.highest_amount;
  const bestWagering = comparison.wagering_comparison.lowest_bonus_wagering;
  const bestTrust = comparison.trust_comparison.highest_trust;
  
  if (bestBonus.slug === bestWagering.slug) {
    recommendation = `${bestBonus.casino_name} offers the best combination of high bonus and low wagering.`;
  } else if (bestTrust.slug === bestBonus.slug) {
    recommendation = `${bestBonus.casino_name} has the highest bonus and best trust score, but ${bestWagering.casino_name} has lower wagering requirements.`;
  } else {
    recommendation = `Choose ${bestBonus.casino_name} for maximum bonus value, ${bestWagering.casino_name} for easier wagering, or ${bestTrust.casino_name} for highest trust.`;
  }
  
  res.status(200).json({
    meta: {
      compared: casinos.length,
      requested: slugs.length,
      not_found: notFound.length > 0 ? notFound : undefined
    },
    casinos: casinos,
    comparisons: comparison,
    ai_recommendation: recommendation,
    quick_pick: {
      best_value: bestBonus,
      easiest_wagering: bestWagering,
      most_trusted: bestTrust
    }
  });
};
