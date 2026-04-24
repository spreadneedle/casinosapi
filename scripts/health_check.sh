#!/bin/bash
# GrokCasino Health Checker
# Curls all casino URLs, checks HTTP status + SSL + parking redirects
# Output: JSON results file for Python to process

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_FILE="/tmp/casino_health_results.json"
URLS_FILE="$SCRIPT_DIR/../casino_urls.json"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting health checks for $(jq length "$URLS_FILE") casinos..."

# Start JSON array
echo "[" > "$RESULTS_FILE"

jq -r '.[] | @json' "$URLS_FILE" | while IFS= read -r casino_json; do
    slug=$(echo "$casino_json" | jq -r '.slug')
    url=$(echo "$casino_json" | jq -r '.url')
    
    # Skip if URL is marked DEFUNCT
    if [[ "$url" == "DEFUNCT" || "$url" == "NOT_FOUND" ]]; then
        echo "  {\"slug\":\"$slug\",\"url\":\"$url\",\"status\":\"defunct\",\"error\":\"marked_defunct\"}," >> "$RESULTS_FILE"
        continue
    fi
    
    echo -n "  Checking $slug ($url)... "
    
    # Curl with timeouts, follow redirects, get final URL + status
    response=$(curl -sL -o /dev/null \
        -w "HTTP_CODE:%{http_code}|FINAL_URL:%{url_effective}|SSL_VERIFY:%{ssl_verify_result}" \
        --max-time 15 \
        --connect-timeout 10 \
        "$url" 2>&1 || echo "TIMEOUT")
    
    # Parse response
    if [[ "$response" == "TIMEOUT" ]]; then
        echo "timeout"
        echo "  {\"slug\":\"$slug\",\"url\":\"$url\",\"status\":\"timeout\",\"error\":\"connection_timeout\"}," >> "$RESULTS_FILE"
    else
        http_code=$(echo "$response" | grep -oP 'HTTP_CODE:\K[0-9]+' || echo "000")
        final_url=$(echo "$response" | grep -oP 'FINAL_URL:\K[^\|]+' || echo "$url")
        ssl_verify=$(echo "$response" | grep -oP 'SSL_VERIFY:\K[0-9]+' || echo "0")
        
        # Detect parking pages (common parking domains)
        parking_domains=("sedo.com" "godaddy.com" "parkingcrew.net" "bodis.com" "hugedomains.com")
        is_parking="false"
        for domain in "${parking_domains[@]}"; do
            if [[ "$final_url" == *"$domain"* ]]; then
                is_parking="true"
                break
            fi
        done
        
        # Determine status
        if [[ "$http_code" == "200" && "$ssl_verify" == "0" && "$is_parking" == "false" ]]; then
            status="ok"
            echo "ok (200)"
        elif [[ "$is_parking" == "true" ]]; then
            status="parking"
            echo "parking ($final_url)"
        elif [[ "$ssl_verify" != "0" ]]; then
            status="ssl_error"
            echo "ssl_error (code $ssl_verify)"
        else
            status="http_${http_code}"
            echo "error ($http_code)"
        fi
        
        echo "  {\"slug\":\"$slug\",\"url\":\"$url\",\"status\":\"$status\",\"http_code\":$http_code,\"final_url\":\"$final_url\",\"ssl_verify\":$ssl_verify}," >> "$RESULTS_FILE"
    fi
    
    sleep 0.5  # Rate limit: 2 checks/sec
done

# Close JSON array (remove trailing comma from last entry)
sed -i '$ s/,$//' "$RESULTS_FILE"
echo "]" >> "$RESULTS_FILE"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Health check complete. Results: $RESULTS_FILE"
