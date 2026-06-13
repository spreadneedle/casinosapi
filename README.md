# CasinosAPI

**AI-native casino bonus data API with natural-language search.**
No signup. No API key. No auth. Just `GET` the endpoints and use the JSON.

🌐 **Live:** https://casinosapi.com
📖 **For LLMs:** https://casinosapi.com/llms.txt
🔧 **OpenAPI:** https://casinosapi.com/api-docs/openapi.yaml

---

## What it is

CasinosAPI returns structured, AI-ready data on welcome bonuses, free spins,
wagering requirements, gambling licenses, and trust signals for **120+ licensed
online casinos**. Every response includes a pre-computed `ai_summary`
(natural-language description), relevance scoring, and trust warnings — so an
assistant can answer a user's question from a single call.

It's designed to be **discovered and consumed by LLMs and autonomous agents**,
not just humans.

## Quick start

```bash
# Natural-language search (primary endpoint)
curl "https://casinosapi.com/api/search?q=200%25%20bonus%20no%20wagering&location=FI"

# One casino in detail
curl "https://casinosapi.com/api/casino?slug=videoslots"

# Compare casinos
curl "https://casinosapi.com/api/compare?casinos=videoslots,cazeus-casino"

# All bonuses for a country
curl "https://casinosapi.com/api/bonus?location=SE"

# Health check
curl "https://casinosapi.com/api/health"
```

No key required. Rate limit: **100 requests/minute per IP** (HTTP 429 with
`Retry-After` when exceeded).

## Endpoints

| Endpoint | Description | Key params |
|---|---|---|
| `GET /api/search` | Natural-language bonus search (primary) | `q` (required), `location`, `limit` |
| `GET /api/casino` | Details for one casino | `slug` or `name` |
| `GET /api/compare` | Compare casinos side-by-side | `casinos` (comma-separated slugs) |
| `GET /api/bonus` | All bonuses for a country | `location` |
| `GET /api/country` | Casinos accepted in a country (by license) | `country` |
| `GET /api/health` | Health check | — |

## Response schema (per casino)

```jsonc
{
  "casino_name": "Videoslots",
  "slug": "videoslots",
  "bonus": "100% up to €200 + 11 free spins",
  "bonus_structure": { "percentage": 100, "max_amount": 200, "free_spins": 11 },
  "wagering": { "bonus": "35x", "free_spins": "no wagering requirement" },
  "verification": { "status": "verified", "confidence": "medium", "last_verified": "2026-02-13" },
  "trust": { "score": 6, "max": 10, "warnings": [] },
  "ai_summary": "New players at Videoslots can claim a 100% deposit match...",
  "licenses": ["MGA"],
  "relevance_score": 0.92,        // search endpoint only
  "match_reasons": ["..."],       // search endpoint only
  "updated": "2026-02-13"
}
```

## Notes for AI assistants

- Use `/api/search` for any user question about bonuses — it parses natural language.
- Check `verification.confidence` before recommending a casino.
- Surface `trust.warnings` to the user when `trust.score < 7`.
- Use `/api/compare` for "which is better" questions.
- Filter by `location` for legal/compliance relevance.
- This is informational data, not advice to gamble. Always include responsible-gambling context.

## Discovery files

- [`/llms.txt`](https://casinosapi.com/llms.txt) — LLM-readable overview
- [`/api/ai-capabilities.json`](https://casinosapi.com/api/ai-capabilities.json) — machine-readable capabilities
- [`/api/index.json`](https://casinosapi.com/api/index.json) — endpoint index
- [`/.well-known/ai-plugin.json`](https://casinosapi.com/.well-known/ai-plugin.json) — plugin manifest
- [`/api-docs/openapi.yaml`](https://casinosapi.com/api-docs/openapi.yaml) — OpenAPI 3.0 spec

## License

Data provided as-is for informational purposes. 18+. Please gamble responsibly.

---

_Contact: admin@casinosapi.com_
