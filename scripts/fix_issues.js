#!/usr/bin/env node
/**
 * Fix specific casino summary issues
 */

const fs = require('fs');
const https = require('https');

const API_KEY = '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';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

const bonusFile = '/home/icem/.openclaw/workspace/grokcasino/api/bonus_enhanced.js';
const raw = fs.readFileSync(bonusFile, 'utf8');
const start = raw.indexOf('[');
const end = raw.lastIndexOf(']') + 1;
const header = raw.substring(0, start);
let data = JSON.parse(raw.substring(start, end));

async function callClaude(prompt) {
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 600,
    system: 'You are a casino review writer. Be factual, concise, and accurate.',
    messages: [{ role: 'user', content: prompt }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      timeout: 45000
    }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          if (json.content?.[0]?.text) resolve(json.content[0].text);
          else reject(new Error(JSON.stringify(json)));
        } catch (e) { reject(e); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', (err) => { req.destroy(); reject(err); });
    req.write(body);
    req.end();
  });
}

async function fixCasino(slug, extraInstructions) {
  const casino = data.find(c => c.slug === slug);
  if (!casino) {
    console.log(`MISSING: ${slug}`);
    return;
  }

  console.log(`\nFixing ${slug}...`);

  const prompt = `Write casino review content.

CASINO: ${casino.casino_name}
BONUS: ${casino.bonus}
WAGERING: ${JSON.stringify(casino.wagering)}
BONUS STRUCTURE: ${JSON.stringify(casino.bonus_structure)}

${extraInstructions}

Return EXACTLY this format (no extra text):
AI_SUMMARY: [2-3 sentence summary with key numbers]
INFO_TEXT: [2-4 sentence description]`;

  try {
    const response = await callClaude(prompt);
    const summaryMatch = response.match(/AI_SUMMARY:\s*(.+?)(?=INFO_TEXT:|$)/s);
    const infoMatch = response.match(/INFO_TEXT:\s*(.+?)$/s);

    if (summaryMatch) casino.ai_summary = summaryMatch[1].trim().replace(/\.{3,}/g, '');
    if (infoMatch) casino.info = infoMatch[1].trim();

    console.log(`  ✓ ${casino.ai_summary?.substring(0, 70)}...`);
  } catch (e) {
    console.log(`  ✗ ${e.message}`);
  }
}

async function main() {
  // Fix Ruhtinas - correct cashback wagering
  await fixCasino('ruhtinas-casino',
    'IMPORTANT: The cashback has 10x wagering requirements. The free spins also have 10x wagering. Do NOT say cashback has no wagering.');

  // Fix short summaries
  await fixCasino('miami-dice-casino',
    'Write a detailed summary with wagering info. Current summary is too short.');
  await fixCasino('spin-casino',
    'Write a detailed summary with wagering info. Current summary is too short.');
  await fixCasino('10bet-casino',
    'Write a detailed summary with wagering info. Current summary is too short.');

  // Save
  const jsonStr = JSON.stringify(data, null, 2);
  const output = header + jsonStr + ';\n\nexport default casinoDataEnhanced;\n';
  fs.writeFileSync(bonusFile, output);
  console.log('\n✅ Saved fixes');
}

main().catch(console.error);
