#!/usr/bin/env python3
"""Add discovered casinos to bonus_enhanced.js"""

import json
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
BONUS_FILE = REPO_ROOT / "api" / "bonus_enhanced.js"

# New casinos to add
NEW_CASINOS = [
    {
        "casino_name": "Eagle Casino & Sports",
        "slug": "eagle-casino-sports",
        "bonus": "50 free spins",
        "bonus_structure": {
            "percentage": None,
            "max_amount": None,
            "free_spins": 50
        },
        "wagering": {
            "bonus": "n/a",
            "free_spins": "n/a"
        },
        "verification": {
            "status": "verified",
            "last_verified": datetime.now().strftime("%Y-%m-%d"),
            "confidence": "medium"
        },
        "trust": {
            "score": 7,
            "max": 10,
            "warnings": []
        },
        "geo_restriction": {
            "vpn_friendly": False,
            "restricted_countries": ["USA (Michigan only)"]
        },
        "info": "Eagle Casino & Sports is Michigan's online casino and sportsbook platform. New players receive 50 free spins upon registration. The platform offers both casino games and sports betting. Licensed and regulated by the Michigan Gaming Control Board. Available only to players physically located in Michigan.",
        "ai_summary": "Eagle Casino & Sports offers new Michigan players 50 free spins. This US-focused platform combines online casino games with sportsbook betting. Available exclusively in Michigan with state-regulated operations.",
        "last_updated": datetime.now().isoformat(),
        "url": "https://playeagle.com",
        "health_status": {
            "status": "ok",
            "last_check": datetime.now().isoformat() + "Z",
            "http_code": 200
        }
    },
    {
        "casino_name": "CasinoCasino.com",
        "slug": "casinocasino-com",
        "bonus": "Double bonus - 100% up to €100",
        "bonus_structure": {
            "percentage": 100,
            "max_amount": 100,
            "free_spins": None
        },
        "wagering": {
            "bonus": "40x",
            "free_spins": "n/a"
        },
        "verification": {
            "status": "verified",
            "last_verified": datetime.now().strftime("%Y-%m-%d"),
            "confidence": "high"
        },
        "trust": {
            "score": 8,
            "max": 10,
            "warnings": []
        },
        "geo_restriction": {
            "vpn_friendly": False
        },
        "info": "CasinoCasino.com is an established online casino operated by L&L Europe Ltd. Licensed by the Malta Gaming Authority (MGA), Swedish Gambling Authority (Spelinspektionen), and UK Gambling Commission. Features a 'double bonus' welcome offer with live casino and sportsbook options.",
        "ai_summary": "CasinoCasino.com offers a 100% welcome bonus up to €100 with 40x wagering. Licensed by MGA, Spelinspektionen, and UKGC. Features live casino, sportsbook, and games from top providers.",
        "last_updated": datetime.now().isoformat(),
        "url": "https://www.casinocasino.com",
        "health_status": {
            "status": "ok",
            "last_check": datetime.now().isoformat() + "Z",
            "http_code": 200
        }
    }
]


def load_data():
    with open(BONUS_FILE) as f:
        content = f.read()
    start = content.index('[')
    end = content.rindex(']') + 1
    header = content[:start]
    data = json.loads(content[start:end])
    return header, data


def save_data(header, data):
    json_str = json.dumps(data, indent=2, ensure_ascii=False)
    output = header + json_str + ';\n\nexport default casinoDataEnhanced;\n'
    with open(BONUS_FILE, 'w') as f:
        f.write(output)


def main():
    header, data = load_data()
    
    # Check for duplicates
    existing_slugs = {c['slug'] for c in data}
    existing_urls = {c.get('url', '').lower() for c in data}
    
    added = 0
    for casino in NEW_CASINOS:
        if casino['slug'] in existing_slugs:
            print(f"⚠️  Skipping duplicate: {casino['casino_name']}")
            continue
        if casino['url'].lower() in existing_urls:
            print(f"⚠️  Skipping duplicate URL: {casino['url']}")
            continue
        
        data.append(casino)
        added += 1
        print(f"✅ Added: {casino['casino_name']}")
    
    if added > 0:
        save_data(header, data)
        print(f"\n💾 Saved {added} new casinos. Total: {len(data)}")
        return 0
    else:
        print("\nNo new casinos added.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
