# CasinosAPI Rules

## Never Remove Casinos Due to Geoblocking

**Rule:** Do not mark casinos as `defunct` or remove them from the database solely because they return HTTP 403, 503, or other blocking status codes from our Estonian server.

**Why:**
- Many legitimate casinos (especially US-regulated ones like Caesars, DraftKings, BetMGM) intentionally geoblock non-US traffic
- Our health checks run from Estonia, which triggers blocks on US-only casinos
- These casinos are NOT defunct — they're operating normally within their licensed jurisdictions

**How to handle:**
1. ✅ **Keep the casino in the database** with its proper license (e.g., `USA_State`)
2. ✅ **Log the health status** (`blocked`, `http_503`, etc.) for monitoring
3. ✅ **Never auto-mark as defunct** based on HTTP status alone
4. ❌ **Only mark defunct** if:
   - Domain DNS fails completely (NXDOMAIN)
   - Domain shows parking page ("for sale", "domain available")
   - Confirmed closure via industry news/announcements
   - Site redirects to a different casino permanently

**License indicators for geo-restricted casinos:**
- `USA_State` → US-regulated casinos (will block non-US IPs)
- `UKGC` → UK Gambling Commission (may block non-UK)
- `Spelinspektionen` → Swedish license (may block non-Swedish)
- `MGA`, `Curacao`, `Anjouan` → Usually international, but may still geoblock

**Example:**
- ✅ Caesars Palace Casino (https://casino.caesars.com) returns 503 from Estonia → Keep in database, status = blocked
- ❌ Dead casino with "domain for sale" page → Mark defunct
