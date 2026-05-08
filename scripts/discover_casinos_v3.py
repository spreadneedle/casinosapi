#!/usr/bin/env python3
"""
Practical casino discovery using Brave search + Playwright validation.

Key insight: Instead of parsing review sites, we:
1. Search for "casino.com" or "casino.io" patterns directly
2. Visit each result with a real browser
3. Check if it's an actual casino operator site
4. Extract bonus info when available
"""

import json
import sys
import re
import requests
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
BONUS_FILE = REPO_ROOT / "api" / "bonus_enhanced.js"

BRAVE_API_KEY = "BSAypcP2Nhj2cUpIjfALU_R8wMTtEDh"

# Search queries focused on finding ACTUAL casino operators
SEARCH_QUERIES = [
    # Actual casino login/register pages (review sites don't have these)
    "inurl:/login OR inurl:/register casino -review -compare",
    # New domain registrations with casino terms
    "site:*.com intitle:casino intitle:login -review",
    # Crypto casinos with actual functionality
    'crypto casino "deposit" "withdraw" -review -compare',
    # Casino platforms' new brands
    "white hat gaming new casino 2026",
    "aspire global new casino brand",
    # Finnish market actual casinos
    "kasino talleta pelaa -review -vertaa",
    # Specific searches for operator sites
    'site:*.casino "sign up" "play now" -review',
    'site:*.bet "live casino" "slots" login -review',
]

# Skip these
SKIP_PATTERNS = [
    'review', 'compare', 'vs-', 'versus', 'best-', 'top-10', 'news.',
    'wikipedia', 'reddit', 'quora', 'medium', 'youtube',
    'askgamblers', 'chipy', 'casinoguru', 'lcb.org',
    'casino.org', 'gambling.com', 'oddschecker',
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
    
    return {'urls': urls, 'domains': domains, 'slugs': slugs}


def search_brave(query, count=10):
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {
        "X-Subscription-Token": BRAVE_API_KEY,
        "Accept": "application/json",
    }
    params = {"q": query, "count": count}
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=15)
        resp.raise_for_status()
        return resp.json().get('web', {}).get('results', [])
    except Exception as e:
        print(f"    Search error: {e}")
        return []


def should_skip(url):
    url_lower = url.lower()
    for pattern in SKIP_PATTERNS:
        if pattern in url_lower:
            return True
    return False


def detect_casino(page):
    """Score a page to determine if it's a real casino (not review site)"""
    html = page.content().lower()
    title = page.title().lower()
    url = page.url.lower()
    score = 0
    reasons = []
    
    # === STRONG NEGATIVE: Review/comparison sites ===
    review_words = ['review', 'compare', 'best ', 'top ', 'vs ', 'versus', 'ranking', 'list']
    if any(r in title for r in review_words) and 'casino' in title:
        return False, 0, ['review site title']
    
    # Check for multiple casino listings (review sites list 5+ casinos)
    # Count unique outbound casino domains
    links = page.query_selector_all('a[href]')
    casino_domains = set()
    for link in links:
        href = (link.get_attribute('href') or '').lower()
        if href.startswith('http'):
            domain = href.split('/')[2].replace('www.', '')
            if any(kw in domain for kw in ['casino', 'bet', 'slots', 'gaming']) and domain not in url:
                casino_domains.add(domain)
    
    if len(casino_domains) >= 5:
        return False, 0, [f'review site ({len(casino_domains)} casino links)']
    
    # Check for comparison tables
    tables = page.query_selector_all('table, [class*="compare"], [class*="comparison"]')
    if len(tables) >= 2:
        return False, 0, ['comparison tables']
    
    # === POSITIVE: Actual casino signals ===
    
    # Login/Register buttons (actual casinos have prominent login)
    login_sels = ['text=/login/i', 'text=/sign in/i', 'text=/register/i', 'text=/sign up/i', 'text=/join now/i']
    login_found = sum(1 for s in login_sels if page.locator(s).count() > 0)
    if login_found >= 2:
        score += 0.35
        reasons.append('login/register')
    
    # Game categories (actual casinos have game lobbies)
    game_cats = ['slots', 'live casino', 'table games', 'jackpots', 'roulette', 'blackjack', 'poker']
    cat_count = sum(1 for c in game_cats if c in html)
    if cat_count >= 3:
        score += 0.25
        reasons.append(f'{cat_count} game cats')
    
    # Game providers (actual casinos list providers)
    providers = ['netent', 'microgaming', 'pragmatic', 'evolution', 'red tiger', 'yggdrasil', 'quickspin']
    prov_count = sum(1 for p in providers if p in html)
    if prov_count >= 2:
        score += 0.2
        reasons.append(f'{prov_count} providers')
    
    # Payment methods
    payments = ['visa', 'mastercard', 'skrill', 'neteller', 'bitcoin', 'crypto', 'trustly']
    pay_count = sum(1 for p in payments if p in html)
    if pay_count >= 2:
        score += 0.15
        reasons.append(f'{pay_count} payments')
    
    # License
    if any(lic in html for lic in ['mga/', 'curacao', 'ukgc']):
        score += 0.1
        reasons.append('license')
    
    # === NEGATIVE: Other non-casino pages ===
    if '/news/' in url or '/blog/' in url:
        score -= 0.3
        reasons.append('news page')
    
    return score >= 0.5, max(0, score), reasons


def extract_info(page, url):
    html = page.content()
    title = page.title()
    
    # Clean name - handle "Login | Casino Name" format
    # Split by common separators and take the last part (usually the brand name)
    parts = re.split(r'\s*[-–|]\s*', title)
    
    # Remove common non-brand words
    ignore_words = ['login', 'sign in', 'register', 'home', 'official', 'site', 'welcome', 'online casino']
    filtered = [p for p in parts if p.lower() not in ignore_words and len(p.strip()) > 2]
    
    if filtered:
        # Usually the brand is the last or first meaningful part
        name = filtered[-1].strip()
        # If too short, use the first part
        if len(name) < 5 and len(filtered) > 1:
            name = filtered[0].strip()
    else:
        # Fallback to domain
        domain = urlparse(url).netloc.replace('www.', '')
        name = domain.split('.')[0].title()
    
    # Clean up
    name = re.sub(r'\s*(Casino|Online|Official)\s*$', '', name, flags=re.I)
    name = name.strip()[:60]
    
    # Extract bonus
    bonus = None
    bonus_patterns = [
        r'(\d+%\s+(?:up to|bonus)\s+[€$£]?\d[\d,]*)',
        r'(welcome bonus\s*:?\s*[€$£]?\d[\d,]*)',
        r'(\d+\s+free spins)',
        r'bonus\s*:?\s*([€$£]?\d[\d,]*(?:\.\d+)?)',
    ]
    for pattern in bonus_patterns:
        match = re.search(pattern, html, re.I)
        if match:
            bonus = match.group(0)[:80]
            break
    
    return {
        'casino_name': name,
        'url': url,
        'bonus': bonus,
    }


def make_slug(name):
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    slug = re.sub(r'-(casino|online|official|site)$', '', slug)
    return slug[:50]


def main():
    print(f"[{datetime.utcnow().isoformat()}Z] Casino Discovery v3 (Browser)")
    print("=" * 60)
    
    existing = load_existing()
    print(f"Loaded {len(existing['slugs'])} existing casinos")
    
    candidates = []
    checked_domains = set()
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800},
            locale='en-US',
        )
        
        for query in SEARCH_QUERIES[:3]:
            print(f"\n🔍 Search: {query[:50]}...")
            results = search_brave(query, count=10)
            print(f"   Found {len(results)} results")
            
            for result in results[:6]:
                url = result.get('url', '').rstrip('/')
                title = result.get('title', '')
                
                if not url or not url.startswith('http'):
                    continue
                
                domain = urlparse(url).netloc.replace('www.', '')
                
                # Skip checks
                if should_skip(url):
                    continue
                if domain in checked_domains:
                    continue
                if url.lower() in existing['urls'] or domain in existing['domains']:
                    continue
                
                checked_domains.add(domain)
                
                print(f"\n   📄 {title[:50]}")
                print(f"      {url[:70]}")
                
                # Visit with browser
                page = context.new_page()
                try:
                    page.goto(url, wait_until='domcontentloaded', timeout=20000)
                    page.wait_for_timeout(3000)
                    
                    is_casino, score, reasons = detect_casino(page)
                    print(f"      Score: {score:.2f} ({', '.join(reasons)})")
                    
                    if is_casino:
                        info = extract_info(page, url)
                        slug = make_slug(info['casino_name'])
                        
                        if slug in existing['slugs']:
                            print(f"      ♻️  Already in DB")
                        else:
                            print(f"      ✅ NEW CASINO!")
                            print(f"         Name: {info['casino_name']}")
                            if info['bonus']:
                                print(f"         Bonus: {info['bonus']}")
                            
                            candidates.append({
                                **info,
                                'slug': slug,
                                'score': round(score, 2),
                                'reasons': reasons,
                            })
                    else:
                        print(f"      ❌ Not a casino")
                        
                except PlaywrightTimeout:
                    print(f"      ⏱️  Timeout")
                except Exception as e:
                    print(f"      ❌ Error: {str(e)[:50]}")
                finally:
                    page.close()
        
        browser.close()
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 RESULTS: {len(candidates)} new casinos found")
    
    if candidates:
        print("\n🎯 NEW CANDIDATES:")
        for c in candidates:
            print(f"\n   ✅ {c['casino_name']}")
            print(f"      URL: {c['url']}")
            print(f"      Score: {c['score']} | Bonus: {c.get('bonus', 'N/A')}")
            print(f"      Signals: {', '.join(c['reasons'])}")
    
    # Save
    output = {
        'candidates': candidates,
        'checked': len(checked_domains),
        'timestamp': datetime.utcnow().isoformat() + 'Z',
    }
    with open('/tmp/discovery_v3.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n💾 Saved to /tmp/discovery_v3.json")
    return 0 if candidates else 1


if __name__ == '__main__':
    sys.exit(main())
