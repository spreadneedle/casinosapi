#!/bin/bash
# GrokCasino Health Checker — Parallelized
# Curls all casino URLs in parallel batches, checks HTTP status + SSL + parking redirects

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_FILE="/tmp/casino_health_results.json"
URLS_FILE="$SCRIPT_DIR/../casino_urls.json"

NUM_URLS=$(jq length "$URLS_FILE")
CONCURRENT=${HEALTH_CHECK_CONCURRENT:-20}
TIMEOUT=${HEALTH_CHECK_TIMEOUT:-5}

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting health checks for $NUM_URLS casinos (parallel=$CONCURRENT, timeout=${TIMEOUT}s)..."

# Create temp dir for parallel results
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Export vars for the subshell
export URLS_FILE TMPDIR TIMEOUT

# Helper: check a single casino by index
check_one() {
    local idx=$1
    local casino_json slug url

    casino_json=$(jq -r ".[$idx] | @json" "$URLS_FILE")
    slug=$(echo "$casino_json" | jq -r '.slug')
    url=$(echo "$casino_json" | jq -r '.url')

    # Skip if URL is marked DEFUNCT
    if [[ "$url" == "DEFUNCT" || "$url" == "NOT_FOUND" ]]; then
        echo '{"slug":"'"$slug"'","url":"'"$url"'","status":"defunct","error":"marked_defunct"}' > "$TMPDIR/$idx.json"
        return
    fi

    # Curl with browser-like headers, short timeout, follow redirects
    local response http_code final_url ssl_verify
    response=$(curl -sL -o /dev/null \
        -w "HTTP_CODE:%{http_code}|FINAL_URL:%{url_effective}|SSL_VERIFY:%{ssl_verify_result}" \
        -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
        -H "Accept-Language: en-US,en;q=0.9" \
        --max-time "$TIMEOUT" \
        --connect-timeout 3 \
        "$url" 2>&1 || echo "TIMEOUT")

    if [[ "$response" == "TIMEOUT" ]]; then
        echo '{"slug":"'"$slug"'","url":"'"$url"'","status":"timeout","error":"connection_timeout"}' > "$TMPDIR/$idx.json"
        return
    fi

    http_code=$(echo "$response" | grep -oP 'HTTP_CODE:\K[0-9]+' || echo "000")
    final_url=$(echo "$response" | grep -oP 'FINAL_URL:\K[^|]+' || echo "$url")
    ssl_verify=$(echo "$response" | grep -oP 'SSL_VERIFY:\K[0-9]+' || echo "0")

    # Detect parking pages
    local is_parking="false"
    case "$final_url" in
        *sedo.com*|*godaddy.com*|*parkingcrew.net*|*bodis.com*|*hugedomains.com*)
            is_parking="true" ;;
    esac

    # Determine status
    local status
    if [[ "$http_code" == "200" && "$ssl_verify" == "0" && "$is_parking" == "false" ]]; then
        status="ok"
    elif [[ "$is_parking" == "true" ]]; then
        status="parking"
    elif [[ "$ssl_verify" != "0" ]]; then
        status="ssl_error"
    elif [[ "$http_code" == "403" || "$http_code" == "405" || "$http_code" == "415" ]]; then
        # Bot/WAF block — site is up but rejecting our request
        status="blocked"
    else
        status="http_${http_code}"
    fi

    # Write JSON result (http_code as string to avoid leading-zero issues)
    printf '{"slug":"%s","url":"%s","status":"%s","http_code":"%s","final_url":"%s","ssl_verify":%s}\n' \
        "$slug" "$url" "$status" "$http_code" "$final_url" "$ssl_verify" > "$TMPDIR/$idx.json"
}
export -f check_one

# Run checks in parallel using xargs
seq 0 $((NUM_URLS - 1)) | xargs -P "$CONCURRENT" -I{} bash -c 'check_one "$@"' _ {}

# Combine results into final JSON array
echo "[" > "$RESULTS_FILE"
for i in $(seq 0 $((NUM_URLS - 1))); do
    if [[ -f "$TMPDIR/$i.json" ]]; then
        cat "$TMPDIR/$i.json" >> "$RESULTS_FILE"
        echo "," >> "$RESULTS_FILE"
    fi
done
# Remove trailing comma and close array
sed -i '$ s/,$//' "$RESULTS_FILE"
echo "]" >> "$RESULTS_FILE"

# Count results
OK_COUNT=$(jq '[.[] | select(.status == "ok")] | length' "$RESULTS_FILE")
BLOCKED_COUNT=$(jq '[.[] | select(.status == "blocked")] | length' "$RESULTS_FILE")
ERROR_COUNT=$(jq '[.[] | select(.status != "ok" and .status != "defunct" and .status != "blocked")] | length' "$RESULTS_FILE")

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Health check complete. OK: $OK_COUNT, Blocked: $BLOCKED_COUNT, Errors: $ERROR_COUNT"
