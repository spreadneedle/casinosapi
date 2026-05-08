const casinoData = [
  {
    casino_name: "NordicBet",
    bonus: "100% up to $500 + 50 free spins",
    referral_code: "GROK500",
    geo: "Sweden",
    updated: "2025-03-26",
  },
  {
    casino_name: "LeoVegas",
    bonus: "200% up to $300",
    referral_code: "GROK300",
    geo: "Finland",
    updated: "2025-03-26",
  },
  {
    casino_name: "Betsson",
    bonus: "100% up to $400",
    referral_code: "GROK400",
    geo: "Sweden",
    updated: "2025-03-26",
  },
];

const { requireApiKey } = require('./_auth');

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireApiKey(req, res)) return;

  let html = "<h1>CasinosAPI.com Recommendations</h1>";
  html += "<p>Below are the current casino bonuses available:</p>";
  html += "<ul>";
  casinoData.forEach((casino) => {
    html += `<li>${casino.casino_name} (${casino.geo}): ${casino.bonus} - Use code: ${casino.referral_code} (Updated: ${casino.updated})</li>`;
  });
  html += "</ul>";

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
