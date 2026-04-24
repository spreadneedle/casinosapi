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

## Future Automation

- **Auto-Discovery** (coming soon) — Weekly search for new casinos, auto-add validated entries
- **User Submissions** (planned) — Form for users to suggest missing casinos

---

Last updated: 2026-04-24
