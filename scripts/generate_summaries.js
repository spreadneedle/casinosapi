#!/usr/bin/env node
/**
 * Batch generate AI summaries and info texts for all casinos
 * Uses Moonshot Kimi K2.6 API + web search
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

const API_KEY = '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';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

// Load database
const bonusFile = '/home/icem/.openclaw/workspace/grokcasino/api/bonus_enhanced.js';
const raw = fs.readFileSync(bonusFile, 'utf8');
const start = raw.indexOf('[');
const end = raw.lastIndexOf(']') + 1;
const header = raw.substring(0, start);
let data = JSON.parse(raw.substring(start, end));

// Load existing progress if any
const progressFile = '/tmp/casino_summary_progress.json';
let processed = new Set();
if (fs.existsSync(progressFile)) {
  const prog = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  processed = new Set(prog.processed || []);
  console.log(`Resuming: ${processed.size} already processed`);
}

// Sleep helper
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Call Claude API
async function callClaude(messages) {
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsgs = messages.filter(m => m.role !== 'system');
  
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 800,
    system: systemMsg,
    messages: userMsgs
  });

  return new Promise((resolve, reject) => {
    const req = https.request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000
    }, (res) => {
      res.setTimeout(30000);
    
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.content?.[0]?.text) {
            resolve(json.content[0].text);
          } else {
            reject(new Error('No content: ' + JSON.stringify(json)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', (err) => {
      req.destroy();
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.write(body);
    req.end();
  });
}

// Web search using Brave API
function webSearch(query) {
  try {
    const result = execSync(`curl -s "https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=3" -H "Accept: application/json" -H "X-Subscription-Token: BSAY1YgIvXxIEgtu7aipZSd8ROcPszr" 2>/dev/null || echo "{}"`, { encoding: 'utf8', timeout: 10000 });
    return JSON.parse(result);
  } catch (e) {
    return { web: { results: [] } };
  }
}

// Fetch page content
function fetchPage(url) {
  try {
    const result = execSync(`curl -sL --max-time 8 --connect-timeout 5 "${url}" 2>/dev/null | head -c 8000`, { encoding: 'utf8', timeout: 15000 });
    // Strip HTML tags
    return result.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);
  } catch (e) {
    return '';
  }
}

// Generate summary for one casino
async function processCasino(casino, index, total) {
  const slug = casino.slug;
  
  if (processed.has(slug)) {
    console.log(`[${index+1}/${total}] SKIP ${slug} (already done)`);
    return;
  }

  console.log(`[${index+1}/${total}] Processing ${slug}...`);

  // Search for casino info
  const searchQuery = `${casino.casino_name} casino bonus review 2026`;
  let searchResults = '';
  try {
    const search = webSearch(searchQuery);
    const results = search.web?.results || search.results || [];
    if (results.length > 0) {
      searchResults = results.slice(0, 2).map(r => `- ${r.title}: ${r.description}`).join('\n');
    }
  } catch (e) {
    searchResults = '';
  }

  // Fetch casino URL if accessible
  let pageContent = '';
  if (casino.url && !casino.url.includes('DEFUNCT') && !casino.url.includes('NOT_FOUND')) {
    pageContent = fetchPage(casino.url);
  }

  // Build prompt
  const prompt = `You are writing casino review content for a comparison website. 

CASINO: ${casino.casino_name}
CURRENT BONUS: ${casino.bonus}
WAGERING: ${JSON.stringify(casino.wagering)}
BONUS STRUCTURE: ${JSON.stringify(casino.bonus_structure)}

SEARCH RESULTS:
${searchResults || '(No search results available)'}

WEBPAGE SNIPPETS:
${pageContent ? pageContent.substring(0, 1500) : '(Site not accessible - geo-blocked or down)'}

TASK: Generate TWO pieces of text:

1. AI_SUMMARY: A concise 2-3 sentence summary of the bonus offer. Include the key numbers (percentage, max amount, free spins, wagering). Write in clear English. Example: "Videoslots offers a 100% match bonus up to €200 plus 11 free spins with no wagering requirements on the spins. The bonus wagering is 35x and is paid out in 10% increments."

2. INFO_TEXT: A longer description (2-4 sentences) explaining how the bonus works, any special conditions, or notable features. If the site is geo-blocked, mention that. If it's a crypto casino, mention that. Be factual.

FORMAT your response EXACTLY like this:
AI_SUMMARY: [your summary here]
INFO_TEXT: [your info here]

Do not include any other text.`;

  try {
    const response = await callClaude([
      { role: 'system', content: 'You are a casino review writer. Be factual, concise, and accurate.' },
      { role: 'user', content: prompt }
    ]);

    // Parse response
    const summaryMatch = response.match(/AI_SUMMARY:\s*(.+?)(?=INFO_TEXT:|$)/s);
    const infoMatch = response.match(/INFO_TEXT:\s*(.+?)$/s);

    if (summaryMatch) {
      casino.ai_summary = summaryMatch[1].trim().replace(/\.{3,}/g, '');
    }
    if (infoMatch) {
      casino.info = infoMatch[1].trim();
    }

    console.log(`  ✓ Summary: ${casino.ai_summary.substring(0, 60)}...`);
    processed.add(slug);

    // Save progress and database every 5 casinos
    if (processed.size % 5 === 0) {
      fs.writeFileSync(progressFile, JSON.stringify({ processed: [...processed] }));
      // Also save current state of database
      const jsonStr = JSON.stringify(data, null, 2);
      const output = header + jsonStr + ';\n\nexport default casinoDataEnhanced;\n';
      fs.writeFileSync(bonusFile, output);
      console.log(`  💾 Progress + DB saved (${processed.size}/${total})`);
    }

    // Rate limit: 3 calls per second max
    await sleep(350);

  } catch (e) {
    console.log(`  ✗ ERROR: ${e.message}`);
    // Save progress on error too
    fs.writeFileSync(progressFile, JSON.stringify({ processed: [...processed] }));
  }
}

// Main
async function main() {
  const total = data.length;
  console.log(`Processing ${total} casinos...`);
  console.log(`Already done: ${processed.size}`);

  for (let i = 0; i < total; i++) {
    await processCasino(data[i], i, total);
  }

  // Write final file
  const jsonStr = JSON.stringify(data, null, 2);
  const output = header + jsonStr + ';\n\nexport default casinoDataEnhanced;\n';
  fs.writeFileSync(bonusFile, output);

  // Clean up progress file
  if (fs.existsSync(progressFile)) {
    fs.unlinkSync(progressFile);
  }

  console.log('\n✅ Done! All casinos processed.');
  console.log(`Total processed: ${processed.size}`);
}

main().catch(console.error);
