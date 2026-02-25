const { requireApiKey } = require('./_auth');

const casinoLicenses = [

  {
    id: 0,
    name: "Sweepstakes Casino (No License Required)",
    validCountries: [
      "US", // United States
      "CA", // Canada
      "GB", // United Kingdom
      "AU", // Australia
      "NZ", // New Zealand
      "DE", // Germany
      "FR", // France
      "IT", // Italy
      "ES", // Spain
      "PT", // Portugal
      "NL", // Netherlands
      "BE", // Belgium
      "SE", // Sweden
      "NO", // Norway
      "DK", // Denmark
      "FI", // Finland
      "IE", // Ireland
      "AT", // Austria
      "CH", // Switzerland
      "PL", // Poland
      "CZ", // Czech Republic
      "SK", // Slovakia
      "HU", // Hungary
      "RO", // Romania
      "BG", // Bulgaria
      "GR", // Greece
      "HR", // Croatia
      "SI", // Slovenia
      "RS", // Serbia
      "ME", // Montenegro
      "MK", // North Macedonia
      "AL", // Albania
      "BA", // Bosnia and Herzegovina
      "UA", // Ukraine
      "BY", // Belarus
      "RU", // Russia
      "TR", // Turkey
      "IL", // Israel
      "ZA", // South Africa
      "NG", // Nigeria
      "KE", // Kenya
      "GH", // Ghana
      "EG", // Egypt
      "MA", // Morocco
      "BR", // Brazil
      "AR", // Argentina
      "CL", // Chile
      "CO", // Colombia
      "PE", // Peru
      "MX", // Mexico
      "JP", // Japan
      "KR", // South Korea
      "IN", // India
      "ID", // Indonesia
      "MY", // Malaysia
      "SG", // Singapore
      "TH", // Thailand
      "VN", // Vietnam
      "PH", // Philippines
    ],
  },
  {
    id: 1,
    name: "Malta Gaming Authority",
    validCountries: [
      "MT",
      "CA",
      "FI",
      "NO",
      "JP",
      "IN",
      "NZ",
      "BR",
      "DE",
      "FR",
      "ES",
      "IT",
      "NL",
      "BE",
      "AT",
      "CH",
      "IE",
      "AU",
      "ZA"],
  },
  {
    id: 2,
    name: "Curaçao eGaming",
    validCountries: [
      "CW",
      "CA",
      "FI",
      "NO",
      "JP",
      "IN",
      "NZ",
      "BR",
      "MX",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "SE"],
  },
  {
    id: 3,
    name: "Gibraltar Gambling Commissioner",
    validCountries: [
      "GI",
      "CA",
      "FI",
      "NO",
      "JP",
      "IN",
      "NZ",
      "BR",
      "DE",
      "FR",
      "ES",
      "IT",
      "NL",
      "BE",
      "AT",
      "CH",
      "IE",
      "AU",
      "ZA"],
  },
  {
    id: 4,
    name: "Kahnawake Gaming Commission",
    validCountries: [
      "CA",
      "MX",
      "BR",
      "JP",
      "IN",
      "NZ",
      "DE",
      "FR",
      "ES",
      "IT",
      "NL",
      "BE",
      "AT",
      "CH",
      "IE",
      "AU",
      "ZA"],
  },
  {
    id: 5,
    name: "Isle of Man Gambling Supervision Commission",
    validCountries: [
      "IM",
      "CA",
      "FI",
      "NO",
      "JP",
      "IN",
      "NZ",
      "BR",
      "DE",
      "FR",
      "ES",
      "IT",
      "NL",
      "BE",
      "AT",
      "CH",
      "IE",
      "AU",
      "ZA"],
  },
  {
    id: 6,
    name: "Alderney Gambling Control Commission",
    validCountries: [
      "GG",
      "CA",
      "FI",
      "NO",
      "JP",
      "IN",
      "NZ",
      "DE",
      "FR",
      "ES",
      "IT",
      "NL",
      "BE",
      "AT",
      "CH",
      "IE",
      "AU",
      "ZA"],
  },
  {
    id: 7,
    name: "Antigua and Barbuda Financial Services Regulatory Commission – Division of Gaming",
    validCountries: [
      "AG",
      "CA",
      "MX",
      "BR",
      "JP",
      "IN",
      "NZ",
      "DE",
      "FR",
      "ES",
      "IT",
      "NL",
      "BE",
      "AT",
      "CH",
      "IE",
      "AU",
      "ZA"],
  },
  { id: 8, name: "UK Gambling Commission", validCountries: ["GB"] },
  {
    id: 9,
    name: "New Jersey Division of Gaming Enforcement",
    validCountries: ["US"],
  },
  { id: 10, name: "Pennsylvania Gaming Control Board", validCountries: ["US"] },
  { id: 11, name: "Michigan Gaming Control Board", validCountries: ["US"] },
  { id: 12, name: "Delaware Lottery", validCountries: ["US"] },
  { id: 13, name: "West Virginia Lottery Commission", validCountries: ["US"] },
  {
    id: 14,
    name: "Connecticut Department of Consumer Protection",
    validCountries: ["US"],
  },
  {
    id: 15,
    name: "Alcohol and Gaming Commission of Ontario",
    validCountries: ["CA"],
  },
  { id: 16, name: "Swedish Gambling Authority", validCountries: ["SE"] },
  { id: 17, name: "Danish Gambling Authority", validCountries: ["DK"] },
  {
    id: 18,
    name: "Italian Customs and Monopolies Agency",
    validCountries: ["IT"],
  },
  {
    id: 19,
    name: "Directorate General for the Regulation of Gambling",
    validCountries: ["ES"],
  },
  { id: 20, name: "National Gambling Authority", validCountries: ["FR"] },
  { id: 21, name: "Netherlands Gambling Authority", validCountries: ["NL"] },
  { id: 22, name: "Belgian Gaming Commission", validCountries: ["BE"] },
  {
    id: 23,
    name: "Joint Gambling Authority of the Federal States",
    validCountries: ["DE"],
  },
  { id: 24, name: "Hellenic Gaming Commission", validCountries: ["GR"] },
  {
    id: 25,
    name: "Gaming Regulation and Inspection Service",
    validCountries: ["PT"],
  },
  { id: 26, name: "National Gambling Office", validCountries: ["RO"] },
  { id: 27, name: "Coljuegos", validCountries: ["CO"] },
  {
    id: 28,
    name: "Philippine Amusement and Gaming Corporation",
    validCountries: ["PH"],
  },
  {
    id: 29,
    name: "Betting Control and Licensing Board",
    validCountries: ["KE"],
  },
  {
    id: 30,
    name: "National Lottery Regulatory Commission",
    validCountries: ["NG"],
  },
  {
    id: 31,
    name: "Estonian Tax and Customs Board",
    validCountries: [
      "EE",
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE"],
  },
  {
    id: 32,
    name: "Lotteries and Gambling Supervisory Inspection of Latvia",
    validCountries: ["LV"],
  },
  {
    id: 33,
    name: "Gambling Supervisory Authority of Lithuania",
    validCountries: ["LT"],
  },
  {
    id: 34,
    name: "Czech Ministry of Finance – Gambling and Lottery Department",
    validCountries: ["CZ"],
  },
  { id: 35, name: "Slovak Gambling Regulatory Office", validCountries: ["SK"] },
  { id: 36, name: "Swiss Federal Gaming Board", validCountries: ["CH"] },
  {
    id: 37,
    name: "Ukrainian Commission for Regulation of Gambling and Lotteries",
    validCountries: ["UA"],
  },
  {
    id: 38,
    name: "Belarus Ministry of Taxes and Levies",
    validCountries: ["BY"],
  },
  {
    id: 39,
    name: "Georgian Revenue Service – Gambling Division",
    validCountries: ["GE"],
  },
  {
    id: 40,
    name: "Ministry of Finance of Armenia – Gambling Licensing Department",
    validCountries: ["AM"],
  },
  {
    id: 41,
    name: "Serbian Games of Chance Administration",
    validCountries: ["RS"],
  },
  {
    id: 42,
    name: "Montenegrin Games of Chance Administration",
    validCountries: ["ME"],
  },
  {
    id: 43,
    name: "Hungarian Supervisory Authority for Regulatory Affairs",
    validCountries: ["HU"],
  },
  { id: 44, name: "Gaming Board of Tanzania", validCountries: ["TZ"] },
  { id: 45, name: "Gaming Commission of Ghana", validCountries: ["GH"] },
  { id: 46, name: "Barbados Gaming Authority", validCountries: ["BB"] },
  {
    id: 47,
    name: "Jamaica Betting, Gaming & Lotteries Commission",
    validCountries: ["JM"],
  },
  {
    id: 48,
    name: "Sierra Leone Gaming, Lottery and Sports Betting Control Board",
    validCountries: ["SL"],
  },
  { id: 49, name: "Panama Gaming Control Board", validCountries: ["PA"] },
  {
    id: 50,
    name: "Ministry of Foreign Trade and Tourism of Peru",
    validCountries: ["PE"],
  },
  {
    id: 51,
    name: "Lotería de la Ciudad de Buenos Aires (LOTBA)",
    validCountries: ["AR"],
  },
  {
    id: 52,
    name: "Buenos Aires Provincial Institute of Lottery and Casinos (IPLyC)",
    validCountries: ["AR"],
  },
  {
    id: 53,
    name: "Costa Rica Ministry of Finance – Data Processing License (unregulated)",
    validCountries: [],
  },
  {
    id: 54,
    name: "Anjouan Gaming Board",
    validCountries: [
      "IN",
      "BR",
      "MX",
      "ZA",
      "FI",
      "NO",
      "NZ",
      "JP",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "SE"],
  },
  {
    id: 55,
    name: "Tobique Gaming Commission",
    validCountries: ["CA", "FI", "NO", "JP", "IN", "NZ", "BR", "MX"],
  }
];


const casinoData = [
  {
  "casino_name": "CaZeus Casino",
  "bonus": "200% up to €1750 + 150 free spins",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "40x",
  "free_spin_value": "€0.10/spin",
  "info": "Updated 2026. Spins released 20 per day, expire in 24h if not claimed.",
  "licenses": [
    31
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "Pelataan Kasino",
  "bonus": "150% up to €300 + 100 free spins",
  "wagering_requirement_bonus": "80x",
  "wagering_requirement_free_spins": "40x",
  "free_spin_value": "€0.10/spin",
  "info": "No registration required. Minimitalletus $20. Spins on Bonanza. Winnings capped at €20.",
  "licenses": [
    31
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "Pelikaani Casino",
  "bonus": "n/a",
  "wagering_requirement_bonus": "n/a",
  "wagering_requirement_free_spins": "0x",
  "free_spin_value": "€0.10/spin",
  "info": "100 free spins + up to 1000 more. No registration required. Minimitalletus 10 €.",
  "licenses": [
    31
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "BetHall Casino",
  "bonus": "200% up to €1750 + 150 free spins",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "40x",
  "free_spin_value": "€0.10/spin",
  "info": "Minimitalletus 20 €. 20 free spins per day over 10 days.",
  "licenses": [
    31
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "LaraBet Casino",
  "bonus": "200% up to €1750 + 150 free spins",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "40x",
  "free_spin_value": "€0.10/spin",
  "info": "Exclusive for new players. Minimitalletus 20 €. 20 free spins per day over 10 days.",
  "licenses": [
    31
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "Valhalla Wins Casino",
  "bonus": "100% up to €1500 + 500 free spins",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "35x",
  "free_spin_value": "€0.10/spin",
  "info": "No registration required. Minimitalletus 25 €. 50 free spins per day over 10 days.",
  "licenses": [
    31
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "KingMaker",
  "bonus": "100% up to €500 + 25 free spins",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "40x",
  "free_spin_value": "€0.10/spin",
  "info": "Minimitalletus 20 €.",
  "licenses": [
    2
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "ViperWin",
  "bonus": "200% up to €1750 + 150 free spins",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "40x",
  "free_spin_value": "€0.10/spin",
  "info": "Minimitalletus 20 €. 20 free spins per day over 10 days.",
  "licenses": [
    2
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "Red Dice",
  "bonus": "200% up to €1000",
  "wagering_requirement_bonus": "30x",
  "wagering_requirement_free_spins": "n/a",
  "free_spin_value": "n/a",
  "info": "Minimitalletus 20 €. Wagering on bonus only.",
  "licenses": [
    31
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "Lempi",
  "bonus": "100% up to €400 + 50 free spins",
  "wagering_requirement_bonus": "80x",
  "wagering_requirement_free_spins": "40x",
  "free_spin_value": "€0.10/spin",
  "info": "Minimitalletus 20 €.",
  "licenses": [
    1
  ],
  "updated": "2026-02-16"
},
  {
  "casino_name": "Playzee Casino",
  "bonus": "100% up to €1,500 + 150 free spins",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "35x",
  "free_spin_value": "€0.10",
  "info": "3-deposit package",
  "licenses": [
    1
  ],
  "updated": "2026-02-16",
  "trust_score": 8,
  "verification": "verified",
  "ai_summary": "MGA Zee Spins loyalty"
},
  {
  "casino_name": "Casoola Casino",
  "bonus": "100% up to €500 + 200 free spins",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "35x",
  "free_spin_value": "€0.10",
  "info": "Robot theme 4-deposit",
  "licenses": [
    1
  ],
  "updated": "2026-02-16",
  "trust_score": 7.5,
  "verification": "verified",
  "ai_summary": "Cyber MGA with tournaments"
},
  {
  "casino_name": "Boom Casino",
  "bonus": "100% up to €100 + 100 FS",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "0x",
  "free_spin_value": "€0.10",
  "info": "PayNPlay zero wager FS",
  "licenses": [
    31
  ],
  "updated": "2026-02-16",
  "trust_score": 8.5,
  "verification": "verified",
  "ai_summary": "Finnish no-account fast payouts"
},
  {
  "casino_name": "Caxino Casino",
  "bonus": "€500 + 500 FS",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "35x",
  "free_spin_value": "€0.10",
  "info": "Rootz smart bonuses",
  "licenses": [
    1
  ],
  "updated": "2026-02-16",
  "trust_score": 8,
  "verification": "verified",
  "ai_summary": "500 FS welcome Rootz platform"
},
  {
  "casino_name": "Simple Casino",
  "bonus": "100% up to €500 + 50 FS",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "35x",
  "free_spin_value": "€0.10",
  "info": "No-account since 2001",
  "licenses": [
    1
  ],
  "updated": "2026-02-16",
  "trust_score": 7.5,
  "verification": "verified",
  "ai_summary": "Instant MGA play"
},
  {
  "casino_name": "Miami Dice Casino",
  "bonus": "200% up to €100 + 50 FS",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "35x",
  "free_spin_value": "€0.10",
  "info": "Miami luxury jackpots",
  "licenses": [
    1
  ],
  "updated": "2026-02-16",
  "trust_score": 7.5,
  "verification": "verified",
  "ai_summary": "200% match Miami theme"
},
  {
  "casino_name": "Jackpot Village Casino",
  "bonus": "100% up to €500",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "n/a",
  "free_spin_value": "n/a",
  "info": "Premium slots jackpots",
  "licenses": [
    1
  ],
  "updated": "2026-02-16",
  "trust_score": 7.5,
  "verification": "verified",
  "ai_summary": "Award-winning slots progressive JP"
},
  {
  "casino_name": "Spinz Casino",
  "bonus": "100% up to €300 + 100 FS",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "0x",
  "free_spin_value": "€0.10",
  "info": "Wager-free FS Finnish popular",
  "licenses": [
    31
  ],
  "updated": "2026-02-16",
  "trust_score": 8,
  "verification": "verified",
  "ai_summary": "Established 2004 wager-free spins"
},
  {
  "casino_name": "Spin Casino",
  "bonus": "100% up to €400",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "n/a",
  "free_spin_value": "n/a",
  "info": "Classic casino",
  "licenses": [
    1
  ],
  "updated": "2026-02-16",
  "trust_score": 7,
  "verification": "verified",
  "ai_summary": "Reliable classic casino"
},
  {
  "casino_name": "10Bet Casino",
  "bonus": "100% up to €100",
  "wagering_requirement_bonus": "35x",
  "wagering_requirement_free_spins": "n/a",
  "free_spin_value": "n/a",
  "info": "Sports + casino",
  "licenses": [
    1
  ],
  "updated": "2026-02-16",
  "trust_score": 7.5,
  "verification": "verified",
  "ai_summary": "Sportsbook casino hybrid"
}
];

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireApiKey(req, res)) return;

  const location = req.query.location;

  if (!location) {
    return res.status(400).json({ error: "Location parameter is required" });
  }

  // Find matching license in casinoData
  const filteredCasinos = filterCasinosByCountry(location);

  // Add documentation links to response headers
  res.setHeader('Link', [
    '<https://grokcasino.online/api-docs>; rel="documentation"',
    '<https://grokcasino.online/api/index.json>; rel="api-index"'
  ].join(', '));

  res.status(200).json({
    casinos: filteredCasinos,
    _links: {
      documentation: "https://grokcasino.online/api-docs",
      api_index: "https://grokcasino.online/api/index.json"
    }
  });
}

function filterCasinosByCountry(country) {
  const licenses = casinoLicenses.filter((l) =>
    l.validCountries.includes(country.toUpperCase())
  );
  return casinoData
    .filter((casino) => {
      // filter casino that has at least one license that is valid in the country
      return casino.licenses.some((id) => licenses.some((l) => l.id === id));
    })
    .map((casino) => ({
      ...casino,
      licenses: casino.licenses
        .map((id) => {
          const license = casinoLicenses.find((l) => l.id === id);
          return license ? license.name : null;
        })
        .filter(Boolean), // Remove any null values in case a license ID wasn't found
    }));
}
