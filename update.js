const fs = require('fs');

// New casinos
const newCasinos = [{"casino_name":"Playzee Casino","bonus":"100% up to €1,500 + 150 free spins","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"35x","free_spin_value":"€0.10","info":"3-deposit package","licenses":[1],"updated":"2026-02-16","trust_score":8.0,"verification":"verified","ai_summary":"MGA Zee Spins loyalty"},{"casino_name":"Casoola Casino","bonus":"100% up to €500 + 200 free spins","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"35x","free_spin_value":"€0.10","info":"Robot theme 4-deposit","licenses":[1],"updated":"2026-02-16","trust_score":7.5,"verification":"verified","ai_summary":"Cyber MGA with tournaments"},{"casino_name":"Boom Casino","bonus":"100% up to €100 + 100 FS","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"0x","free_spin_value":"€0.10","info":"PayNPlay zero wager FS","licenses":[31],"updated":"2026-02-16","trust_score":8.5,"verification":"verified","ai_summary":"Finnish no-account fast payouts"},{"casino_name":"Caxino Casino","bonus":"€500 + 500 FS","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"35x","free_spin_value":"€0.10","info":"Rootz smart bonuses","licenses":[1],"updated":"2026-02-16","trust_score":8.0,"verification":"verified","ai_summary":"500 FS welcome Rootz platform"},{"casino_name":"Simple Casino","bonus":"100% up to €500 + 50 FS","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"35x","free_spin_value":"€0.10","info":"No-account since 2001","licenses":[1],"updated":"2026-02-16","trust_score":7.5,"verification":"verified","ai_summary":"Instant MGA play"},{"casino_name":"Miami Dice Casino","bonus":"200% up to €100 + 50 FS","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"35x","free_spin_value":"€0.10","info":"Miami luxury jackpots","licenses":[1],"updated":"2026-02-16","trust_score":7.5,"verification":"verified","ai_summary":"200% match Miami theme"},{"casino_name":"Jackpot Village Casino","bonus":"100% up to €500","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"n/a","free_spin_value":"n/a","info":"Premium slots jackpots","licenses":[1],"updated":"2026-02-16","trust_score":7.5,"verification":"verified","ai_summary":"Award-winning slots progressive JP"},{"casino_name":"Spinz Casino","bonus":"100% up to €300 + 100 FS","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"0x","free_spin_value":"€0.10","info":"Wager-free FS Finnish popular","licenses":[31],"updated":"2026-02-16","trust_score":8.0,"verification":"verified","ai_summary":"Established 2004 wager-free spins"},{"casino_name":"Spin Casino","bonus":"100% up to €400","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"n/a","free_spin_value":"n/a","info":"Classic casino","licenses":[1],"updated":"2026-02-16","trust_score":7.0,"verification":"verified","ai_summary":"Reliable classic casino"},{"casino_name":"10Bet Casino","bonus":"100% up to €100","wagering_requirement_bonus":"35x","wagering_requirement_free_spins":"n/a","free_spin_value":"n/a","info":"Sports + casino","licenses":[1],"updated":"2026-02-16","trust_score":7.5,"verification":"verified","ai_summary":"Sportsbook casino hybrid"}];

// Read file
let content = fs.readFileSync('api/bonus.js', 'utf8');

// Extract casinoLicenses
const licensesMatch = content.match(/const\s+casinoLicenses\s*=\s*\[([\s\S]*?)\];/);
const casinoLicensesStr = licensesMatch ? `const casinoLicenses = [\n${licensesMatch[1]}\n];` : 'const casinoLicenses = [];';

// Extract casino objects
const casinoRegex = /\{[\s\S]*?casino_name[\s\S]*?\}/g;
const casinoObjects = content.match(casinoRegex) || [];

// Parse
const casinoData = [];
for (let objStr of casinoObjects) {
  try {
    let cleanStr = objStr.replace(/,\s*([}\]])/g, '$1').replace(/([{,]\s*)"([^"]+)":/g, '$1"$2":');
    const parsed = JSON.parse(cleanStr);
    if (parsed.casino_name) casinoData.push(parsed);
  } catch (e) {
    // skip
  }
}

console.log(`Parsed ${casinoData.length} existing casinos.`);

// Dupes
const existingNames = casinoData.map(c => c.casino_name.toLowerCase());
const toAdd = newCasinos.filter(c => !existingNames.includes(c.casino_name.toLowerCase()));
console.log(`Adding ${toAdd.length} new (no dupes)`);

// Append
casinoData.push(...toAdd);

// Rebuild
const newArrayStr = casinoData.map(c => JSON.stringify(c, null, 2)).join(',\n  ');

// Handler part
const handlerPart = content.split('export default function handler')[1] || '\nexport default function handler(req, res) {\n  res.status(200).json({casinos: casinoData});\n}';

// New content
const newContent = `${casinoLicensesStr}\n\n\nconst casinoData = [\n  ${newArrayStr}\n];\n\n${handlerPart}`;

fs.writeFileSync('api/bonus.js', newContent, 'utf8');

console.log('Updated! Total casinos:', casinoData.length);
