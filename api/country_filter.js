const data = require('./bonus_enhanced');
const { requireApiKey } = require('./_auth');

// Country code to name mapping (ISO 3166-1 alpha-2)
const COUNTRY_NAMES = {
  'FI': 'Finland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DE': 'Germany',
  'UK': 'United Kingdom',
  'GB': 'United Kingdom',
  'IE': 'Ireland',
  'CA': 'Canada',
  'US': 'United States',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'JP': 'Japan',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'ZA': 'South Africa',
  'EE': 'Estonia',
  'DK': 'Denmark',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'FR': 'France',
  'ES': 'Spain',
  'IT': 'Italy',
  'PT': 'Portugal',
  'GR': 'Greece',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'SK': 'Slovakia',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'IS': 'Iceland',
  'MT': 'Malta',
  'CY': 'Cyprus',
  'LU': 'Luxembourg',
};

// OFAC sanctioned countries (typically blocked)
const SANCTIONED_COUNTRIES = ['IR', 'KP', 'SY', 'CU', 'AF', 'MM', 'RU', 'BY'];

// License to country acceptance rules
// Format: { license: { accepts: [...], blocks: [...], notes: "..." } }
const LICENSE_RULES = {
  'MGA': {
    accepts: ['ALL_EXCEPT_BLOCKED'],
    blocks: ['US'],
    notes: 'MGA covers EU/EEA broadly. Individual casinos may block locally-regulated markets but many accept them.'
  },
  'Curacao': {
    accepts: ['ALL_EXCEPT_BLOCKED'],
    blocks: ['US', 'IL', 'AU', 'GB', 'UK'],
    notes: 'Curacao accepts most non-sanctioned countries. Many block major regulated markets.'
  },
  'Anjouan': {
    accepts: ['ALL_EXCEPT_BLOCKED'],
    blocks: ['US', 'IL', 'AU', 'GB', 'UK'],
    notes: 'Same as Curacao - very permissive, blocks vary by casino.'
  },
  'UKGC': {
    accepts: ['GB', 'UK', 'JE', 'GG', 'IM'],
    blocks: ['US', 'AU', 'ZA'],
    notes: 'UKGC is UK-only. UK players also play at MGA/Curacao casinos.'
  },
  'Spelinspektionen': {
    accepts: ['SE'],
    blocks: ['US', 'IL', 'AU'],
    notes: 'Swedish license is Sweden-only. But Swedes play at MGA/Curacao/Estonian casinos too.'
  },
  'Estonian': {
    accepts: ['EE', 'FI', 'ALL_EU'],
    blocks: ['US', 'IL', 'AU'],
    notes: 'Estonian license = EU valid. Most Estonian casinos target FI/EE but accept broader EU.'
  },
  'Gibraltar': {
    accepts: ['GB', 'UK', 'IE', 'ALL_EU'],
    blocks: ['US', 'AU'],
    notes: 'Gibraltar license similar to MGA, UK-focused but broader.'
  },
  'Kahnawake': {
    accepts: ['CA', 'US'],
    blocks: ['IL', 'AU', 'GB', 'UK'],
    notes: 'Canada-focused. Some accept US players (gray area).'
  },
  'Isle of Man': {
    accepts: ['GB', 'UK', 'IE', 'ALL_EU'],
    blocks: ['US', 'AU'],
    notes: 'Similar to Gibraltar, UK/EU focused.'
  },
  'USA_State': {
    accepts: ['US'],
    blocks: ['ALL_EXCEPT_US'],
    notes: 'Geo-fenced to specific US state. Physical location verified.'
  }
};

function isCountryAccepted(license, countryCode) {
  const rules = LICENSE_RULES[license];
  if (!rules) {
    // Unknown license - default to accepting all except sanctioned
    return !SANCTIONED_COUNTRIES.includes(countryCode.toUpperCase());
  }

  const cc = countryCode.toUpperCase();

  // Check explicit blocks
  if (rules.blocks.includes(cc)) return false;
  if (rules.blocks.includes('ALL_EXCEPT_US') && cc !== 'US') return false;

  // Check explicit accepts
  if (rules.accepts.includes(cc)) return true;
  if (rules.accepts.includes('ALL_EXCEPT_BLOCKED')) {
    return !SANCTIONED_COUNTRIES.includes(cc);
  }
  if (rules.accepts.includes('ALL_EU')) {
    const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    return euCountries.includes(cc);
  }

  // Default: accept unless sanctioned
  return !SANCTIONED_COUNTRIES.includes(cc);
}

function filterCasinosByCountry(casinos, countryCode) {
  const cc = countryCode.toUpperCase();
  
  return casinos.filter(casino => {
    const licenses = casino.license || [];
    
    // Casino is accepted if ANY of its licenses accepts the country
    return licenses.some(license => isCountryAccepted(license, cc));
  });
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireApiKey(req, res)) return;

  try {
    const casinoDataEnhanced = data.default || [];
    const { country, healthy_only, limit = 200 } = req.query;

    if (!country) {
      return res.status(400).json({ 
        error: 'Country parameter is required',
        example: '/api/casinos?country=FI'
      });
    }

    // Validate country code (basic check)
    if (country.length !== 2) {
      return res.status(400).json({
        error: 'Invalid country code. Use ISO 3166-1 alpha-2 (e.g., FI, SE, DE, UK)'
      });
    }

    let casinos = casinoDataEnhanced;

    // Filter by country
    casinos = filterCasinosByCountry(casinos, country);

    // Filter by health if requested
    if (healthy_only === 'true') {
      casinos = casinos.filter(c => !c.defunct && c.health_status?.status === 'ok');
    }

    // Apply limit
    casinos = casinos.slice(0, parseInt(limit));

    res.status(200).json({
      country: country.toUpperCase(),
      country_name: COUNTRY_NAMES[country.toUpperCase()] || 'Unknown',
      count: casinos.length,
      casinos: casinos
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
