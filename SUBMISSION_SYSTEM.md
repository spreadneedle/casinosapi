# Casino Submission System

## Overview

A submission system for casinos to add new entries or correct existing data, with anti-sabotage protection.

## ⚠️ Important: Vercel Limitation

Vercel serverless functions have ephemeral filesystems. Submissions are stored in memory during the function lifetime but may not persist between requests.

**Workaround options:**
1. **Use a database** (Vercel KV, Redis, MongoDB Atlas) for persistent storage
2. **Webhook to external service** (Google Sheets, Airtable, Notion)
3. **Email notifications** - send submissions directly to you via email
4. **Git-based storage** - commit submissions as JSON files to the repo

## Endpoints

### Submit a Casino
```
POST /api/submit
Content-Type: application/json

{
  "change_type": "new" | "correction" | "amendment" | "removal",
  "casino_name": "Casino Name",
  "casino_url": "https://example.com",
  "submitter_email": "you@casino.com",
  "submitter_role": "Affiliate Manager",
  "changes": {
    "bonus": {"old": "100%", "new": "200%"}
  },
  "proof_url": "https://example.com/terms",
  "notes": "Optional context"
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "sub_abc123",
    "status": "pending",
    "risk_level": "low",
    "domain_match": true,
    "message": "Submission received..."
  }
}
```

### Review Submissions (Admin)
```
GET /api/review?action=list
GET /api/review?action=get&id=sub_abc123
GET /api/review?action=approve&id=sub_abc123&reviewer=admin
GET /api/review?action=reject&id=sub_abc123&reason=Invalid+proof&reviewer=admin
```

## Anti-Sabotage Features

1. **Email Domain Verification**
   - Submitter email must match casino domain
   - Example: `marketing@boostcasino.net` can submit for `boostcasino.net`
   - Trusted operator domains can submit for multiple casinos

2. **Rate Limiting**
   - Max 1 submission per hour per email
   - Max 5 submissions per month per email

3. **Risk Scoring (0-10)**
   - Domain match: -2 points
   - Approved history: -1 to -2 points
   - Rejected history: +1 to +3 points
   - Large changes: +2 to +4 points
   - No proof URL: +1 point
   - First-time submitter: +1 point

4. **Risk Levels**
   - 🟢 Low (0-2): Fast-track approval
   - 🟡 Medium (3-5): Standard review
   - 🔴 High (6-10): Extra scrutiny

## Submission Form

Public form at: https://casinosapi.com/submit

Features:
- Domain match indicator (real-time)
- Change type selector
- Structured changes input
- Proof URL field
- Anti-sabotage notice

## Review Workflow

1. Casino submits via form or API
2. System validates and scores
3. Submission stored (pending)
4. **You review via:**
   - Telegram bot command (to be implemented)
   - Direct API calls
   - Email notifications (to be implemented)
5. Approve → merge into dataset
6. Reject → notify submitter with reason

## Next Steps

To make this production-ready, choose a persistence method:

### Option A: Vercel KV (Recommended)
```bash
npm i @vercel/kv
```
Store submissions in Redis-like KV store.

### Option B: Email Notifications
Send submissions directly to contact@casinosapi.com with all details.

### Option C: Git-based
Auto-commit submissions as JSON files to a `submissions/` directory.

### Option D: Airtable/Notion
Webhook submissions to a spreadsheet/database for manual review.
