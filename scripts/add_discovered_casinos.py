#!/usr/bin/env python3
"""
Add validated casino candidates to the database.
Reads discovery results from stdin (JSON) and updates bonus_enhanced.js.
"""

import json
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
BONUS_FILE = REPO_ROOT / "api" / "bonus_enhanced.js"
URLS_FILE = REPO_ROOT / "casino_urls.json"

def load_bonus_data():
    """Load current casino data"""
    with open(BONUS_FILE) as f:
        content = f.read()
    start = content.index('[')
    end = content.rindex(']') + 1
    header = content[:start]
    data = json.loads(content[start:end])
    return header, data

def save_bonus_data(header, data):
    """Save updated casino data"""
    # Update header timestamp
    header = header.replace(
        re.search(r'// Generated: .*\n', header).group(0),
        f'// Generated: {datetime.utcnow().isoformat()}Z\n'
    )
    header = header.replace(
        re.search(r'// Casinos: \d+', header).group(0),
        f'// Casinos: {len(data)}'
    )
    
    json_str = json.dumps(data, indent=2, ensure_ascii=False)
    new_content = header + json_str + ';\n\nexport default casinoDataEnhanced;\n'
    
    with open(BONUS_FILE, 'w') as f:
        f.write(new_content)

def load_casino_urls():
    """Load casino URLs database"""
    with open(URLS_FILE) as f:
        return json.load(f)

def save_casino_urls(urls):
    """Save updated URLs database"""
    with open(URLS_FILE, 'w') as f:
        json.dump(urls, f, indent=2)

def create_casino_entry(candidate):
    """Convert discovery candidate to full casino entry"""
    return {
        "casino_name": candidate['casino_name'],
        "slug": candidate['slug'],
        "url": candidate['url'],
        "bonus": candidate.get('bonus') or "Contact casino for current offers",
        "bonus_structure": {
            "percentage": None,
            "max_amount": None,
            "free_spins": None
        },
        "wagering": {
            "bonus": "Check terms",
            "free_spins": "Check terms"
        },
        "verification": {
            "status": "needs_verification",
            "last_checked": datetime.utcnow().isoformat() + 'Z',
            "verified_by": "auto-discovery"
        },
        "trust": {
            "rating": None,
            "total_reviews": 0,
            "warning_flags": []
        },
        "geo_restriction": {
            "allowed": [],
            "restricted": []
        },
        "info": {
            "payment_methods": [],
            "currencies": [],
            "languages": [],
            "live_chat": None,
            "mobile_app": None
        },
        "ai_summary": f"{candidate['casino_name']}: Auto-discovered {datetime.utcnow().strftime('%B %Y')}. Verification pending. {candidate.get('bonus', 'Check site for current promotions.')}",
        "last_updated": datetime.utcnow().isoformat() + 'Z',
        "health_status": {
            "status": "ok",
            "last_check": datetime.utcnow().isoformat() + 'Z'
        },
        "auto_discovered": True,
        "discovery_confidence": candidate.get('confidence', 0.0)
    }

def main():
    # Read discovery results from stdin
    try:
        discovery_results = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("Error: Invalid JSON input", file=sys.stderr)
        return 1
    
    candidates = discovery_results.get('candidates', [])
    
    if not candidates:
        print("No candidates to add")
        return 0
    
    print(f"Adding {len(candidates)} new casinos...")
    
    # Load existing data
    header, casinos = load_bonus_data()
    urls_db = load_casino_urls()
    
    added = []
    
    for candidate in candidates:
        # Create full entry
        entry = create_casino_entry(candidate)
        
        # Add to casinos list
        casinos.append(entry)
        
        # Add to URLs database
        urls_db.append({
            "slug": entry['slug'],
            "name": entry['casino_name'],
            "url": entry['url']
        })
        
        added.append(entry['casino_name'])
        print(f"  ✅ {entry['casino_name']} ({entry['slug']})")
    
    # Save updated data
    save_bonus_data(header, casinos)
    save_casino_urls(urls_db)
    
    # Output summary for commit message
    summary = {
        'added': added,
        'count': len(added),
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    
    print(json.dumps(summary, indent=2))
    
    return 0

if __name__ == '__main__':
    import re  # For header timestamp replacement
    sys.exit(main())
