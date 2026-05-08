#!/usr/bin/env python3
"""
Discover new casinos from aggregator "new casinos" pages.
These sites maintain curated lists of newly launched casinos.
"""

import json
import sys
import re
import requests
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
BONUS_FILE = REPO_ROOT / "api" / "bonus_enhanced.js"

BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

# Aggregator pages that list new casinos
AGGREGATOR_SOURCES = [
    {
        'name': 'AskGamblers New Casinos',
        'url': 'https://www.askgamblers.com/online-casinos/newest',
        'casino_selector': r'href="(https?://[^"]+)"[^>]*>\s*<[^>]*>\s*([^<]+)</',
        'url_filter': lambda u: 'askgamblers' not in u and 'javascript' not in u,
    },
    {
        'name': 'Chipy New Casinos',
        'url': 'https://chipy.com/casinos/new-online-casinos',
        'casino_selector': r'href="(https?://[^"]+)"[^>]*>([^<]+)</a>',
        'url_filter': lambda u: 'chipy' not in u and 'javascript' not in u,
    },
    {
        'name': 'CasinoGuru New',
        'url': 'https://casinoguru-en.com/new-online-casinos',
        'casino_selector': r'href="(https?://[^"]+)"[^>]*>([^<]+)</a>',
        'url_filter': lambda u: 'casinoguru' not in u,
    },
    {
        'name': 'LCB New Casinos',
        'url': 'https://lcb.org/new-online-casinos',
        'casino_selector': r'href="(https?://[^"]+)"[^>]*>([^<]+)</a>',
        'url_filter': lambda u: 'lcb.org' not in u,
    },
]


def load_existing():
    with open(BONUS_FILE) as f:
        content = f.read()
    start = content.index('[')
    end = content.rindex(']') + 1
    casinos = json.loads(content[start:end])
    
    urls = {c.get('url', '').lower().rstrip('/') for c in casinos if c.get('url')}
    domains = {urlparse(u).netloc.replace('www.', '') for u in urls}
    slugs = {c['slug'] for c in casinos}
    names = {c['casino_name'].lower() for c in casinos}
    
    return {'urls': urls, 'domains': domains, 'slugs': slugs, 'names': names}


def fetch(url, timeout=15):
    try:
        resp = requests.get(url, headers=BROWSER_HEADERS, timeout=timeout)
        if resp.status_code == 200:
            return resp.text
        return None
    except:
        return None


def check_url(url, timeout=10):
    try:
        resp = requests.get(url, headers=BROWSER_HEADERS, timeout=timeout, allow_redirects=True)
        return {
            'ok': resp.status_code == 200,
            'code': resp.status_code,
            'final': resp.url,
        }
    except:
        return {'ok': False, 'code': 0, 'final': url}


def detect_casino(html, url):
    if not html:
        return False, 0, []
    
    html_lower = html.lower()
    score = 0
    reasons = []
    
    # Login/register
    if re.search(r'>(login|sign in|register|sign up|join now)<', html_lower):
        score += 0.25
        reasons.append('login/register')
    
    # Game categories
    cats = ['slots', 'live casino', 'table games', 'jackpots', 'roulette', 'blackjack']
    cat_count = sum(1 for c in cats if c in html_lower)
    if cat_count >= 3:
        score += 0.25
        reasons.append(f'{cat_count} game cats')
    
    # Providers
    providers = ['netent', 'microgaming', "play'n go", 'pragmatic', 'evolution', 'red tiger']
    prov_count = sum(1 for p in providers if p in html_lower)
    if prov_count >= 2:
        score += 0.2
        reasons.append(f'{prov_count} providers')
    
    # Payments
    payments = ['visa', 'mastercard', 'skrill', 'neteller', 'bitcoin', 'crypto', 'trustly']
    pay_count = sum(1 for p in payments if p in html_lower)
    if pay_count >= 2:
        score += 0.15
        reasons.append(f'{pay_count} payments')
    
    # License
    if any(lic in html_lower for lic in ['mga', 'curacao', 'ukgc', 'license']):
        score += 0.15
        reasons.append('license')
    
    return score >= 0.5, score, reasons


def extract_info(html, url):
    info = {'url': url, 'casino_name': None, 'bonus': None}
    
    if not html:
        return info
    
    title = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
    if title:
        name = title.group(1).strip()
        name = re.sub(r'\s*[-–|]\s*(Online Casino|Casino|Home).*$', '', name, flags=re.I)
        info['casino_name'] = name[:60]
    
    if not info['casino_name']:
        domain = urlparse(url).netloc.replace('www.', '')
        info['casino_name'] = domain.split('.')[0].title()
    
    bonus = re.search(r'(\d+%.*?[€$£]\d+|\d+\s+free spins|welcome bonus.*?[€$£]\d+)', html, re.I)
    if bonus:
        info['bonus'] = bonus.group(1)[:80]
    
    return info


def make_slug(name):
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    slug = re.sub(r'-(casino|online|official)$', '', slug)
    return slug[:50]


def extract_links_from_page(html, base_url, existing):
    """Extract potential casino links from an aggregator page"""
    found = []
    
    # Pattern 1: Casino listing cards
    # Look for links with casino-related text near them
    patterns = [
        # Common casino listing patterns
        r'<a[^>]*href="(https?://(?:www\.)?[a-z0-9-]+\.(?:com|net|org|io|co|fi|eu|lv|ee)[^"]*)"[^>]*>(?:\s*<[^>]+>)*\s*([^<]{3,40})</',
        # Outbound links with casino names
        r'data-href="(https?://[^"]+)"[^>]*>\s*<[^>]*>\s*([^<]{3,40})</',
        # Simple link pattern
        r'href="(https?://[^"]+)"[^>]*>\s*([^<]{3,40})</a>',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, html, re.IGNORECASE)
        for url, text in matches:
            url = url.strip()
            text = text.strip()
            
            # Skip non-casino
            if not any(kw in url.lower() for kw in ['casino', 'bet', 'slots', 'gaming', 'gamble', 'loko']):
                continue
            
            # Skip known bad
            if any(bad in url.lower() for bad in ['askgamblers', 'chipy', 'casinoguru', 'lcb.org',
                                                    'facebook', 'twitter', 'google', 'youtube',
                                                    'affiliate', 'track', 'redirect']):
                continue
            
            # Skip already in DB
            domain = urlparse(url).netloc.replace('www.', '')
            if url.lower().rstrip('/') in existing['urls'] or domain in existing['domains']:
                continue
            
            # Skip if text is generic
            if text.lower() in ['click here', 'read more', 'visit', 'play now', '']:
                continue
            
            found.append((url, text))
    
    # Deduplicate
    seen = set()
    unique = []
    for url, text in found:
        domain = urlparse(url).netloc
        if domain not in seen:
            seen.add(domain)
            unique.append((url, text))
    
    return unique[:20]


def main():
    print(f"[{datetime.utcnow().isoformat()}Z] Aggregator Discovery")
    print("=" * 60)
    
    existing = load_existing()
    print(f"Loaded {len(existing['slugs'])} existing casinos")
    
    candidates = []
    checked = set()
    
    for source in AGGREGATOR_SOURCES[:2]:  # Limit to save time
        print(f"\n🔍 {source['name']}")
        print(f"   URL: {source['url']}")
        
        html = fetch(source['url'])
        if not html:
            print(f"   ❌ Failed to fetch")
            continue
        
        links = extract_links_from_page(html, source['url'], existing)
        print(f"   Found {len(links)} potential casino links")
        
        for casino_url, casino_text in links[:10]:  # Check top 10
            if casino_url in checked:
                continue
            checked.add(casino_url)
            
            print(f"\n   📄 {casino_text[:40]}")
            print(f"      URL: {casino_url[:70]}")
            
            # Quick check
            check = check_url(casino_url)
            if not check['ok']:
                print(f"      ❌ HTTP {check['code']}")
                continue
            
            # Fetch and validate
            page_html = fetch(casino_url)
            is_casino, score, reasons = detect_casino(page_html, casino_url)
            
            print(f"      Score: {score:.2f} ({', '.join(reasons)})")
            
            if is_casino:
                info = extract_info(page_html, casino_url)
                slug = make_slug(info['casino_name'])
                
                if slug in existing['slugs']:
                    print(f"      ♻️  Already in DB")
                    continue
                
                print(f"      ✅ NEW: {info['casino_name']}")
                if info['bonus']:
                    print(f"         Bonus: {info['bonus']}")
                
                candidates.append({
                    **info,
                    'slug': slug,
                    'score': round(score, 2),
                    'reasons': reasons,
                    'source': source['name'],
                })
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 FOUND {len(candidates)} NEW CASINOS")
    for c in candidates:
        print(f"\n   ✅ {c['casino_name']}")
        print(f"      {c['url']}")
        print(f"      Score: {c['score']} | Bonus: {c.get('bonus', 'N/A')}")
    
    # Save
    output = {
        'candidates': candidates,
        'checked_count': len(checked),
        'timestamp': datetime.utcnow().isoformat() + 'Z',
    }
    with open('/tmp/discovery_aggregator.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    return 0 if candidates else 1


if __name__ == '__main__':
    sys.exit(main())
