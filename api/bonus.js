const casinoData = [
  {
    casino_name: "NordicBet",
    bonus: "100% up to $500 + 50 free spins",
    referral_code: "GROK500",
    geo: "Sweden",
    updated: "2025-03-26"
  },
  {
    casino_name: "LeoVegas",
    bonus: "200% up to $300",
    referral_code: "GROK300",
    geo: "Finland",
    updated: "2025-03-26"
  },
  {
    casino_name: "Betsson",
    bonus: "100% up to $400",
    referral_code: "GROK400",
    geo: "Sweden",
    updated: "2025-03-26"
  }
];

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const location = req.query.location;
  
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is required' });
  }

  const filteredCasinos = casinoData.filter(casino => 
    casino.geo.toLowerCase() === location.toLowerCase()
  );
  
  res.status(200).json(filteredCasinos);
} 