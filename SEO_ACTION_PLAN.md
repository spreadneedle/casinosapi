# GrokCasino SEO Action Plan — AI Visibility Focus

**Goal:** Maximize citations in ChatGPT, Claude, Perplexity, Gemini, and Google AI Overviews.

---

## Current State Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Domain | ✅ casinosapi.com | Brandable, memorable |
| AI positioning | ✅ Strong | "AI-optimized casino bonus data" messaging |
| API structure | ✅ Excellent | Natural language search, OpenAPI spec |
| Structured data | ⚠️ Partial | ai-capabilities.json present, but missing Schema.org |
| Content depth | ⚠️ Thin | API docs only, no long-form content |
| Backlinks | ❌ Unknown | Need analysis |
| Entity recognition | ❌ Weak | Not established as "known entity" in AI training data |

---

## Phase 1: Technical Foundation (Week 1-2)

### 1.1 Add Schema.org Structured Data

**Why:** AI systems parse Schema.org markup to understand entities and relationships.

**Actions:**

```html
<!-- On homepage -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GrokCasino",
  "url": "https://casinosapi.com",
  "description": "AI-optimized casino bonus comparison with natural language search",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://casinosapi.com/api/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>

<!-- For each casino -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CasinoName",
  "url": "https://casino-url.com",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "7.5",
    "bestRating": "10",
    "reviewCount": "1"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Casino Bonuses",
    "itemListElement": {
      "@type": "Offer",
      "name": "Welcome Bonus",
      "description": "100% up to €200 + 50 free spins",
      "price": "0",
      "priceCurrency": "EUR"
    }
  }
}
</script>
```

**Priority:** HIGH — Do this first.

### 1.2 Create Human-Readable Pages

**Problem:** The site is 100% API. AI training data heavily favors HTML content over JSON APIs.

**Solution:** Generate static HTML pages for each casino:

```
/casinos/videoslots
/casinos/casinocasino-com
/casinos/eagle-casino-sports
...
```

Each page should include:
- H1 with casino name
- Structured bonus info (with Schema markup)
- AI-generated review content (we already have this!)
- FAQ section (see Phase 2)
- Related casinos

**Implementation:** Use Next.js ISR or a simple static site generator that reads bonus_enhanced.js.

### 1.3 Add sitemap.xml + robots.txt

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://casinosapi.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- One entry per casino page -->
  <url>
    <loc>https://casinosapi.com/casinos/videoslots</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## Phase 2: Content Strategy (Week 2-4)

### 2.1 Create "Casino Guide" Content

AI systems prefer comprehensive, authoritative content. Create pages for:

| Page | Purpose | AI Query Match |
|------|---------|----------------|
| `/guides/best-welcome-bonuses-2026` | Top bonuses list | "What are the best casino bonuses?" |
| `/guides/no-wagering-casinos` | No wagering guide | "Which casinos have no wagering requirements?" |
| `/guides/crypto-casinos` | Crypto gambling | "Best crypto casinos with instant withdrawal" |
| `/guides/pay-n-play-casinos-finland` | Finnish market | "Pay n play casinos Finland" |
| `/guides/casino-wagering-explained` | Educational | "What does 35x wagering mean?" |

**Content format for AI optimization:**
- Clear H2/H3 structure
- Bulleted lists (AI loves these)
- Comparison tables
- FAQ sections with Schema markup
- Direct answers in first 2 sentences

### 2.2 Add FAQ Schema to Every Page

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is the best casino bonus with low wagering?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "CasinoCasino.com offers a 100% bonus up to €100 with 40x wagering..."
    }
  }]
}
```

**Why:** Google AI Overviews and Perplexity directly pull from FAQ schema.

### 2.3 Create Comparison Pages

AI systems love structured comparisons. Generate pages like:

- `/compare/videoslots-vs-casumo`
- `/compare/best-bonuses-under-500-euros`
- `/compare/crypto-casinos-no-kyc`

Use the existing `/api/compare` endpoint data to populate these.

---

## Phase 3: Entity Building (Week 3-6)

### 3.1 Establish "GrokCasino" as Entity

**Problem:** AI systems don't know "GrokCasino" is a thing. You need to appear in places LLMs train on.

**Actions:**

1. **Get listed on Crunchbase, LinkedIn, Product Hunt**
   - Create company profiles
   - List as "Casino bonus intelligence platform"

2. **Publish on Medium/Dev.to**
   - "How we built an AI-friendly casino API"
   - "Natural language search for casino bonuses"
   - Link back to casinosapi.com

3. **Get mentioned on relevant sites**
   - Casino affiliate forums (GPWA, CAP)
   - Developer forums (Reddit r/webdev, HN)
   - AI/LLM communities

4. **Create a Wikipedia-adjacent presence**
   - Wikidata entry (if eligible)
   - Appear in "List of casino bonus comparison sites" articles

### 3.2 Build Topical Authority

AI systems trust sites that cover a topic comprehensively. Target these topic clusters:

```
Casino Bonuses (pillar)
├── Welcome Bonuses
├── No Deposit Bonuses
├── Free Spins
├── Cashback
├── Wagering Requirements
├── Bonus Codes
└── Seasonal Promotions

Casino Types (pillar)
├── Crypto Casinos
├── Pay N Play Casinos
├── Mobile Casinos
├── Live Dealer Casinos
└── Sports Betting Sites

Geographic (pillar)
├── Finnish Casinos
├── Estonian Casinos
├── UK Casinos
├── US Casinos
└── Curacao Licensed Casinos
```

Each cluster needs 5-10 supporting articles.

---

## Phase 4: Distribution & Links (Ongoing)

### 4.1 Get Listed in AI Directories

Submit to:
- **TheresAnAIForThat.com** — AI tool directory
- **FutureTools.io** — AI tools
- **Product Hunt** — Launch as "AI casino comparison tool"
- **OpenAPI Directory** — API marketplace
- **RapidAPI** — API hub
- **AI-Powered.directory**

### 4.2 Create Shareable Tools

Build free tools that get linked:

- **Wagering Calculator** (`/tools/wagering-calculator`)
- **Bonus Value Estimator** (`/tools/bonus-value`)
- **Casino License Checker** (`/tools/license-check`)

These attract natural backlinks and AI citations.

### 4.3 PR & Outreach

**Angle:** "AI meets casino bonuses — how GrokCasino is changing affiliate marketing"

Target:
- iGaming Business (igamingbusiness.com)
- CasinoBeats
- SBC News
- Affiliate marketing blogs

---

## Phase 5: Monitor & Iterate (Ongoing)

### 5.1 Track AI Citations

**Weekly checks:**

```
ChatGPT: "What are the best casino bonuses in 2026?"
Claude: "Compare casino welcome bonuses"
Perplexity: "Best no wagering casino bonuses"
Gemini: "Finnish online casino bonuses"
```

Document if GrokCasino is cited. If not, optimize content for those queries.

### 5.2 Track Traditional SEO

- Google Search Console — impressions for "casino bonus" terms
- Ahrefs/SEMrush — ranking for target keywords
- Brand mentions — use Google Alerts for "grokcasino"

### 5.3 Content Refresh Cycle

- Update bonus data weekly (automated via cron)
- Refresh guide content monthly
- Add new casino pages as discovered

---

## Quick Wins (Do Today)

1. ✅ Add Schema.org to homepage
2. ✅ Create `/casinos/[slug]` pages for top 20 casinos
3. ✅ Add sitemap.xml
4. ✅ Submit to Google Search Console
5. ✅ Create first guide page: `/guides/best-casino-bonuses-2026`
6. ✅ Add FAQ schema to homepage

---

## Success Metrics

| Metric | Baseline | 3-Month Target |
|--------|----------|----------------|
| AI citation rate | 0% | 10% of test queries |
| Organic traffic | Unknown | +200% |
| Indexed pages | 1 | 200+ |
| Backlinks | Unknown | 50+ |
| Brand mentions | 0 | 20+ |

---

## Resource Requirements

| Task | Time | Cost |
|------|------|------|
| Schema markup | 2 hours | Free |
| Static page generation | 4 hours | Free |
| 10 guide articles | 20 hours | $200-500 (if outsourced) |
| Entity building | 10 hours | Free |
| Directory submissions | 3 hours | Free |
| Monitoring setup | 2 hours | Free |
| **Total** | **~41 hours** | **$0-500** |

---

*Created: 2026-05-05*
*Next review: 2026-06-05*
