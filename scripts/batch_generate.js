#!/usr/bin/env node
/**
 * Process casinos in small batches with proper timeout handling
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

// Find remaining
const remaining = data.filter(c => !c.ai_summary || c.ai_summary.endsWith('...'));
console.log(`Remaining: ${remaining.length}/${data.length}`);

if (remaining.length === 0) {
  console.log('All done!');
  process.exit(0);
}

// Process only first BATCH_SIZE
const BATCH_SIZE = 15;
const batch = remaining.slice(0, BATCH_SIZE);
console.log(`Processing batch of ${batch.length}: ${batch.map(c => c.slug).join(', ')}`);

async function callClaude(prompt) {
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 600,
    system: 'You are a casino review writer. Be factual, concise, and accurate. Always format output exactly as requested.',
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
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.content?.[0]?.text) {
            resolve(json.content[0].text);
          } else {
            reject(new Error(JSON.stringify(json)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', (err) => { req.destroy(); reject(err); });
    req.write(body);
    req.end();
  });
}

async function processCasino(casino) {
  const prompt = `Write casino review content.

CASINO: ${casino.casino_name}
BONUS: ${casino.bonus}
WAGERING: bonus ${casino.wagering?.bonus || 'n/a'}, free spins ${casino.wagering?.free_spins || 'n/a'}
STRUCTURE: ${JSON.stringify(casino.bonus_structure)}

Return EXACTLY this format (no extra text):
AI_SUMMARY: [2-3 sentence summary with key numbers]
INFO_TEXT: [2-4 sentence description]`;

  try {
    const response = await callClaude(prompt);
    const summaryMatch = response.match(/AI_SUMMARY:\s*(.+?)(?=INFO_TEXT:|$)/s);
    const infoMatch = response.match(/INFO_TEXT:\s*(.+?)$/s);
    
    if (summaryMatch) casino.ai_summary = summaryMatch[1].trim().replace(/\.{3,}/g, '');
    if (infoMatch) casino.info = infoMatch[1].trim();
    
    console.log(`  ✓ ${casino.slug}: ${casino.ai_summary?.substring(0, 50)}...`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${casino.slug}: ${e.message.substring(0, 80)}`);
    return false;
  }
}

async function main() {
  for (const casino of batch) {
    await processCasino(casino);
    await new Promise(r => setTimeout(r, 500)); // Rate limit
  }
  
  // Save
  const jsonStr = JSON.stringify(data, null, 2);
  const output = header + jsonStr + ';\n\nexport default casinoDataEnhanced;\n';
  fs.writeFileSync(bonusFile, output);
  console.log(`Saved ${BATCH_SIZE} casinos. ${remaining.length - batch.length} remaining.`);
}

main().catch(console.error);
