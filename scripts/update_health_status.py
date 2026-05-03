#!/usr/bin/env python3
"""
Update bonus_enhanced.js with health check results.
Adds/updates 'health_status' field and marks casinos as defunct after 2 consecutive errors.
"""

import json
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
BONUS_FILE = REPO_ROOT / "api" / "bonus_enhanced.js"
RESULTS_FILE = Path("/tmp/casino_health_results.json")
HISTORY_FILE = REPO_ROOT / "scripts" / "health_history.json"

def load_history():
    """Load previous health check results to detect consecutive errors"""
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE) as f:
            return json.load(f)
    return {}

def save_history(history):
    """Save current health check results for next run"""
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def load_bonus_data():
    """Load current casino data from bonus_enhanced.js"""
    with open(BONUS_FILE) as f:
        content = f.read()
    
    # Extract JSON array
    start = content.index('[')
    end = content.rindex(']') + 1
    header = content[:start]
    data = json.loads(content[start:end])
    
    return header, data

def save_bonus_data(header, data):
    """Write updated casino data back to bonus_enhanced.js"""
    json_str = json.dumps(data, indent=2, ensure_ascii=False)
    new_content = header + json_str + ';\n\nexport default casinoDataEnhanced;\n'
    
    with open(BONUS_FILE, 'w') as f:
        f.write(new_content)

def main():
    # Load health check results
    if not RESULTS_FILE.exists():
        print(f"Error: {RESULTS_FILE} not found. Run health_check.sh first.")
        sys.exit(1)
    
    with open(RESULTS_FILE) as f:
        health_results = json.load(f)
    
    # Build slug -> status map
    health_map = {r['slug']: r for r in health_results}
    
    # Load previous history
    history = load_history()
    
    # Load casino data
    header, casinos = load_bonus_data()
    
    # Track changes for commit message
    changes = {
        'updated': 0,
        'newly_defunct': 0,
        'errors': [],
        'recovered': []
    }
    
    # Update each casino
    for casino in casinos:
        slug = casino['slug']
        
        if slug not in health_map:
            continue  # Skip if not in health check results
        
        health = health_map[slug]
        prev_status = history.get(slug, {}).get('status', 'ok')
        new_status = health['status']
        
        # Add/update health_status field
        old_health = casino.get('health_status', {})
        casino['health_status'] = {
            'status': new_status,
            'last_check': datetime.utcnow().isoformat() + 'Z',
            'http_code': int(health.get('http_code', 0)) if health.get('http_code') else None,
            'error': health.get('error')
        }
        
        # Determine if this is a hard failure (worthy of defunct marking)
        hard_failure_codes = ['http_404', 'http_500', 'http_502', 'http_503', 'timeout', 'parking']
        soft_failure_codes = ['http_403', 'http_405', 'ssl_error']  # Alive but blocking
        
        is_hard_failure = new_status in hard_failure_codes
        is_soft_failure = new_status in soft_failure_codes
        
        # Track consecutive HARD failures only (need 3+ days for defunct)
        consecutive_hard_failures = 0
        if is_hard_failure:
            # Count how many days this same hard failure has persisted
            if prev_status == new_status:
                prev_consecutive = history.get(slug, {}).get('consecutive_failures', 0)
                consecutive_hard_failures = prev_consecutive + 1
            else:
                consecutive_hard_failures = 1
        
        # Mark as defunct only after 3+ days of HARD failures
        if consecutive_hard_failures >= 3:
            if not casino.get('defunct', False):
                casino['defunct'] = True
                casino['verification']['status'] = 'closed'
                changes['newly_defunct'] += 1
                changes['errors'].append(f"{casino['casino_name']}: {new_status} (3+ days hard failure, marked defunct)")
        elif is_hard_failure and consecutive_hard_failures > 0:
            # Hard failure but not yet 3 days
            changes['errors'].append(f"{casino['casino_name']}: {new_status} (day {consecutive_hard_failures}/3)")
        elif is_soft_failure:
            # Soft failure (403/405) - note but don't mark defunct
            if prev_status == 'ok':
                changes['errors'].append(f"{casino['casino_name']}: {new_status} (geo-block/method-block, not defunct)")
        elif new_status == 'ok' and prev_status != 'ok':
            # Recovered
            if casino.get('defunct'):
                changes['recovered'].append(f"{casino['casino_name']}: recovered but still marked defunct")
            else:
                changes['recovered'].append(f"{casino['casino_name']}: recovered")
        
        if old_health != casino['health_status']:
            changes['updated'] += 1
    
    # Save updated data
    save_bonus_data(header, casinos)
    
    # Save current results as history with consecutive failure tracking
    new_history = {}
    for r in health_results:
        slug = r['slug']
        status = r['status']
        
        # Track consecutive failures for hard errors
        hard_failure_codes = ['http_404', 'http_500', 'http_502', 'http_503', 'timeout', 'parking']
        if status in hard_failure_codes:
            prev_consecutive = history.get(slug, {}).get('consecutive_failures', 0)
            if history.get(slug, {}).get('status') == status:
                consecutive = prev_consecutive + 1
            else:
                consecutive = 1
        else:
            consecutive = 0
        
        new_history[slug] = {
            'status': status,
            'date': datetime.utcnow().isoformat(),
            'consecutive_failures': consecutive
        }
    
    save_history(new_history)
    
    # Print summary for commit message
    print(json.dumps(changes, indent=2))
    
    return 0 if changes['newly_defunct'] == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
