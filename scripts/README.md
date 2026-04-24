# GrokCasino Automation Scripts

## Health Check System

**Purpose:** Daily automated monitoring of all casino URLs to detect downtime, SSL issues, and parking pages.

### Scripts

1. **`health_check.sh`**  
   - Curls all 128 casino URLs from `casino_urls.json`
   - Checks: HTTP status, SSL cert validity, parking page redirects
   - Output: `/tmp/casino_health_results.json`
   - Runtime: ~2 minutes (0.5s delay between checks)

2. **`update_health_status.py`**  
   - Reads health check results
   - Updates `api/bonus_enhanced.js` with `health_status` field
   - Tracks consecutive errors (2 days → mark as defunct)
   - Maintains history in `scripts/health_history.json`
   - Output: JSON summary of changes

3. **`run_health_check.sh`** (wrapper)  
   - Runs both scripts above
   - Commits changes to git with detailed message
   - Pushes to origin/main (triggers Vercel deploy)
   - Silent operation unless cron fails

### Cron Schedule

- **Job:** `grokcasino-health-check`
- **Schedule:** Daily at 3:00 AM (Europe/Tallinn)
- **Model:** Claude Opus 4.6
- **Notifications:** Only on cron failure

### Manual Run

```bash
cd /home/icem/.openclaw/workspace/grokcasino
./scripts/run_health_check.sh
```

### Health Status Values

- `ok` — Site is up, 200 status, valid SSL
- `http_403` / `http_404` / `http_500` — HTTP error codes
- `timeout` — Connection timeout (15s)
- `ssl_error` — Invalid/expired SSL certificate
- `parking` — Redirects to parking domain (GoDaddy, Sedo, etc.)
- `defunct` — Marked after 2 consecutive days of same error

### Git Workflow

All automated commits are prefixed with `[health-check]` for easy filtering:

```bash
# View all health check commits
git log --grep="[health-check]"

# See what changed in last health check
git show HEAD

# Revert last health check if needed
git revert HEAD
```

### Files Created

- `scripts/health_history.json` — Previous run results (for consecutive error detection)
- `/tmp/casino_health_results.json` — Latest health check output (temporary)

---

## Auto-Discovery System

**Purpose:** Weekly automated search for new casinos, with validation and auto-add.

### Scripts

1. **`discover_casinos.py`**  
   - Searches Brave API for new casino candidates
   - Queries: "new online casino 2026", "crypto casino", etc.
   - Validates each candidate:
     - HTTP 200 status check
     - Not a duplicate (URL/name/slug)
     - Casino keywords present (casino, slots, bonus)
     - Quality signals (footer, terms, licensing)
     - Not a parking/construction page
   - Calculates confidence score (0.0-1.0)
   - Output: JSON with candidates, invalid, duplicates

2. **`add_discovered_casinos.py`**  
   - Reads discovery results from stdin
   - Creates full casino entries for valid candidates
   - Adds to `api/bonus_enhanced.js` and `casino_urls.json`
   - Marks entries as `verification.status: "needs_verification"`
   - Sets `auto_discovered: true` flag

3. **`run_auto_discovery.sh`** (wrapper)  
   - Runs discovery → validation → add pipeline
   - Auto-commits and pushes validated additions
   - Sends Telegram alert for invalid candidates
   - Silent if no new casinos found

### Cron Schedule

- **Job:** `grokcasino-auto-discovery`
- **Schedule:** Mondays at 10:00 AM (Europe/Tallinn)
- **Model:** Claude Sonnet 4.5
- **Notifications:** Alerts for invalid candidates + on error

### Validation Criteria

A casino must pass all checks to be auto-added:

- ✅ HTTP 200 status
- ✅ Not a duplicate URL/name/slug
- ✅ Contains ≥2 casino keywords
- ✅ Has footer or legal links
- ✅ Not a parking/construction page
- ✅ Confidence score ≥ 0.6

**Manual review needed:**
- Invalid candidates → Telegram alert with URL + reason
- Auto-added entries → marked `needs_verification`

### Manual Run

```bash
cd /home/icem/.openclaw/workspace/grokcasino
./scripts/run_auto_discovery.sh
```

---

## Future Automation

- **User Submissions** (planned) — Form for users to suggest missing casinos

---

Last updated: 2026-04-24
