# Submission System - Status Report

## ✅ What's Working

### 1. Submission Form
- **URL:** https://casinosapi.com/submit
- Features: Domain match verification, risk scoring, change type selector
- Auto-approval for low-risk + domain match submissions

### 2. API Endpoints
- `POST /api/submit` — Submit new casino or correction
- `GET /api/review?action=list` — List pending submissions
- `GET /api/review?action=approve&id=...` — Approve submission
- `GET /api/review?action=reject&id=...` — Reject submission

### 3. Anti-Sabotage
- Email domain must match casino domain
- Rate limiting (1/hour, 5/month)
- Risk scoring (0-10)
- Auto-approval for low-risk submissions

### 4. Test Result
```
✅ Auto-approved! Your submission will be merged shortly.
ID: sub_9663fb40038cfd8c
Risk: LOW (domain match: true)
```

## ⚠️ GitHub Actions Not Triggering

The workflow file exists at `.github/workflows/process-submissions.yml` but GitHub Actions runs aren't showing up.

### Possible Causes:
1. **Repo is private** — GitHub API returns 404 without auth token
2. **Actions disabled** — Need to enable in repo settings
3. **Billing** — GitHub Actions might need setup for private repos

### Manual Workaround:
Since GitHub Actions isn't working, here's how to process submissions manually:

```bash
# 1. Check out submissions branch
git checkout submissions

# 2. See pending submissions
ls submissions/pending/

# 3. Review a submission
cat submissions/pending/sub_xxx.json

# 4. If approved, run merge script
node scripts/merge-submissions.js

# 5. Commit and push
git add -A
git commit -m "[auto] Merge approved submissions"
git push origin main

# 6. Move processed submissions
git checkout submissions
mv submissions/pending/*.json submissions/approved/
git add -A
git commit -m "[auto] Move processed submissions"
git push origin submissions
```

## 🔧 Next Steps to Fix GitHub Actions

1. **Check if repo is private:**
   - Go to https://github.com/philipwallenius/grokcasino.online/settings
   - Scroll to "Danger Zone" → see if "Change visibility" says "Public" or "Private"

2. **Enable GitHub Actions:**
   - Go to Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is selected

3. **If private repo:**
   - GitHub Actions is free for public repos
   - Private repos get 2,000 minutes/month free
   - May need to add billing info if exceeded

4. **Alternative: Use GitHub CLI to trigger manually:**
   ```bash
   gh workflow run process-submissions.yml --ref submissions
   ```

## 📋 Current Submission Flow

1. User submits via https://casinosapi.com/submit
2. API validates and scores
3. Low-risk + domain match → Auto-approved (stored in memory)
4. Medium/high risk → Pending (stored in memory)
5. **You review via:**
   - Telegram bot command (to be implemented)
   - Direct API calls
   - Manual git workflow

## 💡 Recommendation

For now, use the **manual git workflow** to process submissions. It's free, reliable, and gives you full control. Once GitHub Actions is configured, it can be automated.

Would you like me to:
1. Add Telegram notifications for new submissions?
2. Create a simple admin dashboard at `/admin`?
3. Set up email notifications to contact@casinosapi.com?
