#!/bin/bash
# Main health check automation wrapper
# Runs health check, updates data, commits to git, pushes to trigger deploy

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "=== GrokCasino Health Check Automation ==="
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Step 1: Run health checks (bash script)
echo "Step 1: Checking 128 casino URLs..."
"$SCRIPT_DIR/health_check.sh"

# Step 2: Update bonus_enhanced.js with results (Python)
echo ""
echo "Step 2: Updating casino database..."
CHANGES=$("$SCRIPT_DIR/update_health_status.py")
echo "$CHANGES"

# Parse changes for commit message
UPDATED=$(echo "$CHANGES" | jq -r '.updated')
DEFUNCT=$(echo "$CHANGES" | jq -r '.newly_defunct')
ERRORS=$(echo "$CHANGES" | jq -r '.errors | length')
RECOVERED=$(echo "$CHANGES" | jq -r '.recovered | length')

# Step 3: Commit changes if any
if [[ "$UPDATED" -gt 0 || "$DEFUNCT" -gt 0 ]]; then
    echo ""
    echo "Step 3: Committing changes to git..."
    
    # Build commit message
    COMMIT_MSG="[health-check] Update health status for $UPDATED casinos

Summary:
- Casinos updated: $UPDATED
- Newly defunct: $DEFUNCT
- New errors: $ERRORS
- Recovered: $RECOVERED

Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    # Add detailed error list if any
    if [[ "$ERRORS" -gt 0 || "$DEFUNCT" -gt 0 ]]; then
        COMMIT_MSG="$COMMIT_MSG

Errors:"
        echo "$CHANGES" | jq -r '.errors[]' | while read -r line; do
            COMMIT_MSG="$COMMIT_MSG
- $line"
        done
    fi
    
    # Add recovery list if any
    if [[ "$RECOVERED" -gt 0 ]]; then
        COMMIT_MSG="$COMMIT_MSG

Recovered:"
        echo "$CHANGES" | jq -r '.recovered[]' | while read -r line; do
            COMMIT_MSG="$COMMIT_MSG
- $line"
        done
    fi
    
    git add api/bonus_enhanced.js scripts/health_history.json
    git commit -m "$COMMIT_MSG"
    
    # Step 4: Push to trigger Vercel deploy
    echo ""
    echo "Step 4: Pushing to origin/main (triggers deploy)..."
    git push origin main
    
    echo ""
    echo "✅ Health check complete and deployed!"
else
    echo ""
    echo "ℹ️  No changes detected. All casinos stable."
fi

echo ""
echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
