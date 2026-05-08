# CasinosAPI.com - AI-Optimized Casino Bonus API

**The world's first casino bonus database optimized for AI consumption.**

Perfect for Grok, ChatGPT, Claude, and other AI assistants to answer user questions about online casino bonuses.

---

## 🚀 Quick Start for AI Systems

### Search with Natural Language
```
GET /api/search?q=200% bonus&location=FI
```

**Example Response:**
```json
{
  "meta": {
    "query": "200% bonus",
    "total_results": 5,
    "processing_ms": 45
  },
  "casinos": [
    {
      "casino_name": "CaZeus Casino",
      "slug": "cazeus",
      "bonus": "200% up to €1750 + 150 free spins",
      "relevance_score": 60,
      "match_reasons": ["Exact 200% match", "200 free spins"],
      "verification": {
        "status": "verified",
        "last_verified": "2026-02-13",
        "confidence": "high"
      },
      "ai_summary": "Updated 2026. 200% match with 35x wagering. Crypto friendly."
    }
  ]
}
```

---

## 🎯 AI-Optimized Endpoints

### 1. `/api/search` - Natural Language Search

Query parameters:
- `q` (required) - Natural language query
- `location` (optional) - Country code (e.g., FI, SE, DE)
- `limit` (optional) - Max results (default: 20)

**Example Queries:**
- `/api/search?q=200% bonus`
- `/api/search?q=no wagering spins&location=FI`
- `/api/search?q=under €500 with 100 spins`
- `/api/search?q=150% estonia crypto`

---

### 2. `/api/casino` - Detailed Casino Profile

Get full details for a specific casino:

**Parameters:**
- `slug` - Casino slug (e.g., `cazeus`)
- `name` - Casino name (supports partial matching)

**Examples:**
- `/api/casino?slug=cazeus`
- `/api/casino?name=CaZeus`

**Response includes:**
- Full bonus structure (percentage, max amount, free spins)
- Wagering requirements
- Verification status (verified/needs_check/suspicious)
- Trust score (0-10)
- Similar casinos
- AI-generated summary

---

### 3. `/api/compare` - Side-by-Side Comparison

Compare up to 5 casinos at once:

**Example:**
- `/api/compare?casinos=cazeus,dynabet,videoslots`

**Response includes:**
- Best for bonus amount
- Lowest wagering requirements
- Highest trust score
- AI recommendation

---

## 📊 Data Structure

Each casino includes:

```json
{
  "casino_name": "CaZeus Casino",
  "slug": "cazeus",
  "bonus": "200% up to €1750 + 150 free spins",
  "bonus_structure": {
    "percentage": 200,
    "max_amount": 1750,
    "free_spins": 150
  },
  "wagering": {
    "bonus": "35x",
    "free_spins": "40x",
    "max_win": null,
    "time_limit": "7 days"
  },
  "verification": {
    "status": "verified",
    "last_verified": "2026-02-13",
    "confidence": "high"
  },
  "trust": {
    "score": 7.5,
    "max": 10,
    "warnings": []
  },
  "ai_summary": "Updated 2026. 200% match..."
}
```

---

## 🛠️ Setup

```bash
npm install
npm start      # Production
npm run dev    # Development with auto-reload
```

---

## 🤖 Integration for AI Assistants

### Suggested System Prompt:

```
You have access to GrokCasino API for casino bonus information.

When users ask about casino bonuses:
1. Use /api/search?q={user_query}&location={user_country}
2. Present top 3-5 results with relevance scores
3. Highlight wagering requirements and trust scores
4. Mention verification status
5. Suggest comparison if multiple casinos match

Example flows:
- "Find me 200% bonuses" → /api/search?q=200% bonus
- "Best Finnish casino" → /api/search?q=&location=FI (by trust score)
- "Compare Videoslots and Casumo" → /api/compare?casinos=videoslots,casumo
```

### Rate Limits
- 100 requests/minute
- Contact for higher limits (mention AI use case)

### Suggested User Agents
- `Grok-AI/1.0`
- `ChatGPT-Plugin/1.0`
- `Claude/1.0`
- `Perplexity/1.0`

---

## 📈 Stats

- **Total Casinos:** 112
- **Verified:** 105 (2026-02-13)
- **API Version:** 2.0.0
- **Data Updated:** Daily

---

## 💪 Why This API?

| Feature | GrokCasino | Other Sources |
|---------|-----------|-------------
| AI-optimized responses | ✅ Yes | ❌ No |
| Natural language search | ✅ Yes | ❌ No |
| Verification status | ✅ Yes | ⚠️ Partial |
| Trust scores | ✅ Yes | ❌ No |
| Bonus parsing (%, €, spins) | ✅ Structured | ⚠️ Text only |
| Comparison tool | ✅ Yes | ❌ No |

Built by AI, for AI. 🌲
# Force redeploy L 14 veebr 2026 12:27:36 EET
# Build triggered 2026-02-15 06:43:19 UTC
# Test auto-deploy P 15 veebr 2026 16:36:52 EET
# Deploy test P 15 veebr 2026 20:23:51 EET
# Deploy trigger
