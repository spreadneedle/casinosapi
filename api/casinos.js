const data = require('./bonus_enhanced');
const { requireApiKey } = require('./_auth');

// License to country acceptance rules
const LICENSE_RULES = {
  'MGA': { accepts: ['ALL_EXCEPT_BLOCKED'], blocks: ['US'] },
  'Curacao': { accepts: ['ALL_EXCEPT_BLOCKED'], blocks: ['US', 'IL', 'AU', 'GB', 'UK'] },
  'Anjouan': { accepts: ['ALL_EXCEPT_BLOCKED'], blocks: ['US', 'IL', 'AU', 'GB', 'UK'] },
  'UKGC': { accepts: ['GB', 'UK', 'JE', 'GG', 'IM'], blocks: ['US', 'AU', 'ZA'] },
  'Spelinspektionen': { accepts: ['SE'], blocks: ['US', 'IL', 'AU'] },
  'Estonian': { accepts: ['EE', 'FI', 'ALL_EU'], blocks: ['US', 'IL', 'AU'] },
  'Gibraltar': { accepts: ['GB', 'UK', 'IE', 'ALL_EU'], blocks: ['US', 'AU'] },
  'Kahnawake': { accepts: ['CA', 'US'], blocks: ['IL', 'AU', 'GB', 'UK'] },
  'Isle of Man': { accepts: ['GB', 'UK', 'IE', 'ALL_EU'], blocks: ['US', 'AU'] },
  'USA_State': { accepts: ['US'], blocks: ['ALL_EXCEPT_US'] }
};

const SANCTIONED_COUNTRIES = ['IR', 'KP', 'SY', 'CU', 'AF', 'MM', 'RU', 'BY'];
const EU_COUNTRIES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

function isCountryAccepted(license, countryCode) {
  const rules = LICENSE_RULES[license];
  if (!rules) {
    return !SANCTIONED_COUNTRIES.includes(countryCode.toUpperCase());
  }

  const cc = countryCode.toUpperCase();

  if (rules.blocks.includes(cc)) return false;
  if (rules.blocks.includes('ALL_EXCEPT_US') && cc !== 'US') return false;

  if (rules.accepts.includes(cc)) return true;
  if (rules.accepts.includes('ALL_EXCEPT_BLOCKED')) {
    return !SANCTIONED_COUNTRIES.includes(cc);
  }
  if (rules.accepts.includes('ALL_EU')) {
    return EU_COUNTRIES.includes(cc);
  }

  return !SANCTIONED_COUNTRIES.includes(cc);
}

function filterByCountry(casinos, countryCode) {
  const cc = countryCode.toUpperCase();
  return casinos.filter(casino => {
    const licenses = casino.license || [];
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

    let casinos = casinoDataEnhanced;

    // Filter by country if provided
    if (country) {
      if (country.length !== 2) {
        return res.status(400).json({
          error: 'Invalid country code. Use ISO 3166-1 alpha-2 (e.g., FI, SE, DE, UK)'
        });
      }
      casinos = filterByCountry(casinos, country);
    }

    if (healthy_only === 'true') {
      casinos = casinos.filter(c => !c.defunct && c.health_status?.status === 'ok');
    }

    casinos = casinos.slice(0, parseInt(limit));

    const response = {
      count: casinos.length,
      casinos: casinos
    };

    if (country) {
      response.country = country.toUpperCase();
    }

    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
