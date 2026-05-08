#!/bin/bash
# Auto-discovery wrapper
# Runs weekly casino discovery, validates candidates, auto-adds valid ones, alerts on invalid

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DISCOVERY_RESULTS="/tmp/discovery_results.json"
TELEGRAM_CHAT="5024563450"

cd "$REPO_ROOT"

echo "=== CasinosAPI Auto-Discovery ==="
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Step 1: Run discovery (Python script)
echo "Step 1: Searching for new casinos..."
"$SCRIPT_DIR/discover_casinos.py" > "$DISCOVERY_RESULTS"

# Check if we found anything
CANDIDATES=$(jq -r '.candidates | length' "$DISCOVERY_RESULTS")
INVALID=$(jq -r '.invalid | length' "$DISCOVERY_RESULTS")
DUPLICATES=$(jq -r '.duplicates | length' "$DISCOVERY_RESULTS")

echo ""
echo "Discovery results:"
echo "  Valid candidates: $CANDIDATES"
echo "  Invalid: $INVALID"
echo "  Duplicates: $DUPLICATES"

# Step 2: Handle invalid candidates (Telegram alert)
if [[ "$INVALID" -gt 0 ]]; then
    echo ""
    echo "Step 2: Sending Telegram alert for invalid candidates..."
    
    # Build alert message
    ALERT="🔍 Auto-Discovery: Found $INVALID unverified casinos

Manual review needed:"
    
    jq -r '.invalid[] | "• \(.title)\n  URL: \(.url)\n  Reason: \(.reason)"' "$DISCOVERY_RESULTS" | while read -r line; do
        ALERT="$ALERT
$line"
    done
    
    # Send via openclaw message tool (you'll need to handle this in the cron)
    echo "$ALERT" > /tmp/discovery_alert.txt
    echo "Alert saved to /tmp/discovery_alert.txt"
fi

# Step 3: Auto-add valid candidates
if [[ "$CANDIDATES" -gt 0 ]]; then
    echo ""
    echo "Step 3: Adding $CANDIDATES valid casinos to database..."
    
    ADD_RESULTS=$(cat "$DISCOVERY_RESULTS" | "$SCRIPT_DIR/add_discovered_casinos.py")
    echo "$ADD_RESULTS"
    
    ADDED_COUNT=$(echo "$ADD_RESULTS" | jq -r '.count')
    ADDED_NAMES=$(echo "$ADD_RESULTS" | jq -r '.added | join(", ")')
    
    # Step 4: Commit and push
    echo ""
    echo "Step 4: Committing changes..."
    
    COMMIT_MSG="[auto-discovery] Add $ADDED_COUNT new casinos

Casinos added:
$(echo "$ADD_RESULTS" | jq -r '.added[]' | sed 's/^/- /')

All entries marked as 'needs_verification' for manual review.

Discovery date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    git add api/bonus_enhanced.js casino_urls.json
    git commit -m "$COMMIT_MSG"
    
    echo ""
    echo "Step 5: Pushing to origin/main (triggers deploy)..."
    git push origin main
    
    echo ""
    echo "✅ Auto-discovery complete! Added: $ADDED_NAMES"
else
    echo ""
    echo "ℹ️  No new casinos found this week."
fi

echo ""
echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
