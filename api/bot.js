// Telegram Bot Webhook Handler for CasinosAPI
// POST /api/bot

const { casinoDataEnhanced } = require('./bonus_enhanced');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_KEY = process.env.CASINOS_API_KEY || 'grokcasino-api-key-2026-02-24-abcdef123456';
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://casinosapi.com/bonuses';

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const update = req.body;

  if (!update) {
    return res.status(400).json({ error: 'No update body' });
  }

  // Handle message
  if (update.message) {
    handleMessage(update.message);
  }

  // Handle inline queries (optional, for @botname search)
  if (update.inline_query) {
    handleInlineQuery(update.inline_query);
  }

  res.status(200).json({ ok: true });
};

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  if (text.startsWith('/start')) {
    await sendMessage(chatId, 
      '🎰 *Welcome to CasinosAPI!*\n\n' +
      'Find the best casino bonuses, compare deals, and discover new casinos.\n\n' +
      '*Commands:*\n' +
      '🎁 /bonus — Top bonus offers\n' +
      '🆕 /new — Latest casinos\n' +
      '⚖️ /compare — Compare bonuses\n' +
      '🔍 /search [term] — Find casinos\n' +
      '📱 Open Mini App — Browse all casinos', 
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🎰 Open CasinosAPI', web_app: { url: MINI_APP_URL } }
          ]]
        }
      }
    );
    return;
  }

  if (text === '/bonus') {
    const bonuses = casinoDataEnhanced
      .filter(c => !c.defunct && c.bonus && c.bonus.amount > 0)
      .sort((a, b) => (b.bonus.amount || 0) - (a.bonus.amount || 0))
      .slice(0, 5);

    let reply = '🎰 *Top Bonus Offers*\n\n';
    bonuses.forEach((c, i) => {
      const flag = c.locations?.map(l => {
        const map = { FI: '🇫🇮', SE: '🇸🇪', NO: '🇳🇴', DE: '🇩🇪', UK: '🇬🇧', US: '🇺🇸', CA: '🇨🇦', EU: '🇪🇺' };
        return map[l] || '🌍';
      }).join('') || '🌍';

      reply += `${i + 1}. *${c.name}* ${flag}\n`;
      reply += `   💰 ${c.bonus.type}: ${c.bonus.text}\n`;
      reply += `   🎰 Wagering: ${c.bonus.wagering?.deposit || 'N/A'}x deposit\n`;
      if (c.bonus.free_spins) reply += `   🎡 ${c.bonus.free_spins.amount} free spins\n`;
      reply += `   [Visit Casino](${c.url})\n\n`;
    });
    reply += `📱 [Browse all in Mini App](${MINI_APP_URL})`;

    await sendMessage(chatId, reply, { parse_mode: 'Markdown', disable_web_page_preview: true });
    return;
  }

  if (text === '/new') {
    const newCasinos = casinoDataEnhanced
      .filter(c => !c.defunct && c.verified?.new_casino)
      .slice(0, 5);

    let reply = '🆕 *New Casinos*\n\n';
    newCasinos.forEach((c, i) => {
      reply += `${i + 1}. *${c.name}*\n`;
      reply += `   📝 ${c.ai_summary}\n`;
      reply += `   ⭐ Trust: ${c.trust_score}/10\n\n`;
    });
    reply += `📱 [Browse all in Mini App](${MINI_APP_URL})`;

    await sendMessage(chatId, reply, { parse_mode: 'Markdown' });
    return;
  }

  if (text === '/compare') {
    const top3 = casinoDataEnhanced
      .filter(c => !c.defunct && c.bonus)
      .sort((a, b) => (b.bonus.amount || 0) - (a.bonus.amount || 0))
      .slice(0, 3);

    let reply = '⚖️ *Bonus Comparison*\n\n';
    top3.forEach(c => {
      reply += `*${c.name}*\n`;
      reply += `💰 ${c.bonus.text}\n`;
      reply += `🎰 Wagering: ${c.bonus.wagering?.deposit || 'N/A'}x\n`;
      reply += `🎡 Free Spins: ${c.bonus.free_spins?.amount || 0}\n`;
      reply += `⏱️ Min Deposit: €${c.bonus.min_deposit || 'N/A'}\n`;
      reply += `📅 Updated: ${c.last_updated || 'N/A'}\n\n`;
    });
    reply += `📱 [Full comparison in Mini App](${MINI_APP_URL})`;

    await sendMessage(chatId, reply, { parse_mode: 'Markdown' });
    return;
  }

  if (text.startsWith('/search ')) {
    const query = text.slice(8).toLowerCase();
    const results = casinoDataEnhanced
      .filter(c => !c.defunct && (
        c.name.toLowerCase().includes(query) ||
        c.ai_summary?.toLowerCase().includes(query) ||
        c.bonus?.text?.toLowerCase().includes(query)
      ))
      .slice(0, 5);

    if (results.length === 0) {
      await sendMessage(chatId, `🔍 No casinos found for "${query}". Try another search or browse the Mini App.`, {
        reply_markup: { inline_keyboard: [[{ text: '🎰 Open Mini App', web_app: { url: MINI_APP_URL } }]] }
      });
      return;
    }

    let reply = `🔍 *Search: "${query}"*\n\n`;
    results.forEach((c, i) => {
      reply += `${i + 1}. *${c.name}*\n`;
      reply += `   ${c.ai_summary?.substring(0, 100)}...\n`;
      reply += `   [Visit Casino](${c.url})\n\n`;
    });
    reply += `📱 [Browse all in Mini App](${MINI_APP_URL})`;

    await sendMessage(chatId, reply, { parse_mode: 'Markdown' });
    return;
  }

  // Default: help
  await sendMessage(chatId,
    '❓ *CasinosAPI Bot*\n\n' +
    'Available commands:\n' +
    '🎁 /bonus — Top bonuses\n' +
    '🆕 /new — New casinos\n' +
    '⚖️ /compare — Compare bonuses\n' +
    '🔍 /search [name/bonus] — Find casinos\n' +
    '📱 Open Mini App — Full browser',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🎰 Open CasinosAPI', web_app: { url: MINI_APP_URL } }
        ]]
      }
    }
  );
}

async function handleInlineQuery(inlineQuery) {
  const query = inlineQuery.query.toLowerCase();
  const results = casinoDataEnhanced
    .filter(c => !c.defunct && (
      c.name.toLowerCase().includes(query) ||
      c.ai_summary?.toLowerCase().includes(query)
    ))
    .slice(0, 10)
    .map((c, i) => ({
      type: 'article',
      id: c.slug || String(i),
      title: c.name,
      description: c.ai_summary?.substring(0, 100) || 'Casino details',
      input_message_content: {
        message_text: `🎰 *${c.name}*\n💰 ${c.bonus?.text || 'No bonus info'}\n⭐ Trust: ${c.trust_score}/10\n🔗 ${c.url || 'N/A'}`,
        parse_mode: 'Markdown'
      },
      reply_markup: {
        inline_keyboard: [[
          { text: '🎰 Open in App', web_app: { url: `${MINI_APP_URL}?casino=${c.slug}` } }
        ]]
      }
    }));

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerInlineQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inline_query_id: inlineQuery.id,
      results: results,
      cache_time: 300
    })
  });
}

async function sendMessage(chatId, text, options = {}) {
  if (!BOT_TOKEN) {
    console.error('No TELEGRAM_BOT_TOKEN set');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        ...options
      })
    });
  } catch (e) {
    console.error('Send message error:', e);
  }
}
