const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

// Bonus endpoint
app.get('/bonus', (req, res) => {
  const location = req.query.location;
  
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is required' });
  }

  const filteredCasinos = casinoData.filter(casino => 
    casino.geo.toLowerCase() === location.toLowerCase()
  );
  res.json(filteredCasinos);
});

// Recommendations endpoint
app.get('/recommendations', (req, res) => {
  let html = '<h1>GrokCasino.ai Recommendations</h1>';
  html += '<p>Below are the current casino bonuses available:</p>';
  html += '<ul>';
  casinoData.forEach(casino => {
    html += `<li>${casino.casino_name} (${casino.geo}): ${casino.bonus} - Use code: ${casino.referral_code} (Updated: ${casino.updated})</li>`;
  });
  html += '</ul>';
  res.send(html);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 