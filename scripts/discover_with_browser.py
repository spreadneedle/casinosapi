#!/usr/bin/env python3
"""
Discover new casinos using Playwright headless browser.
This bypasses bot protection and renders JavaScript-heavy aggregator pages.
"""

import json
import sys
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
BONUS_FILE = REPO_ROOT / "api" / "bonus_enhanced.js"

# Aggregator sources
AGGREGATOR_SOURCES = [
    {
        'name': 'AskGamblers New',
        'url': 'https://www.askgamblers.com/online-casinos/newest',
        'wait_for': '.casino-card, [data-testid="casino-item"], .casino-item',
    },
    {
        'name': 'Chipy New',
        'url': 'https://chipy.com/casinos/new-online-casinos',
        'wait_for': '.casino-item, .casino-card, [class*="casino"]',
    },
    {
        'name': 'CasinoGuru New',
        'url': 'https://casino.guru/new-online-casinos',
        'wait_for': '.casino-item, [data-testid], .game-item',
    },
    {
        'name': 'NewCasinos.com',
        'url': 'https://newcasinos.com/',
        'wait_for': '.casino, [class*="casino"], article',
    },
]

# Skip these domains
SKIP_DOMAINS = {
    'askgamblers.com', 'chipy.com', 'casino.guru', 'casinoguru', 'lcb.org',
    'newcasinos.com', 'google.com', 'facebook.com', 'twitter.com', 'x.com',
    'youtube.com', 'reddit.com', 'trustpilot.com',
}


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


def should_skip(url):
    domain = urlparse(url).netloc.lower().replace('www.', '')
    for skip in SKIP_DOMAINS:
        if skip in domain:
            return True
    return False


def detect_casino(page, url):
    """Use Playwright to detect if page is a real casino"""
    html = page.content().lower()
    score = 0
    reasons = []
    
    # Check for login/register buttons
    login_selectors = [
        'text=Login', 'text=Sign In', 'text=Log In',
        'text=Register', 'text=Sign Up', 'text=Join Now',
        'button:has-text("Login")', 'button:has-text("Register")',
    ]
    login_count = 0
    for sel in login_selectors:
        try:
            if page.query_selector(sel):
                login_count += 1
        except:
            pass
    if login_count >= 2:
        score += 0.3
        reasons.append('login/register buttons')
    
    # Game categories
    cats = ['slots', 'live casino', 'table games', 'jackpots', 'roulette', 'blackjack', 'poker']
    cat_count = sum(1 for c in cats if c in html)
    if cat_count >= 3:
        score += 0.25
        reasons.append(f'{cat_count} game categories')
    
    # Game providers
    providers = ['netent', 'microgaming', 'play\'n go', 'pragmatic play', 'evolution', 'red tiger']
    prov_count = sum(1 for p in providers if p in html)
    if prov_count >= 2:
        score += 0.2
        reasons.append(f'{prov_count} providers')
    
    # Payments
    payments = ['visa', 'mastercard', 'skrill', 'neteller', 'bitcoin', 'crypto', 'trustly']
    pay_count = sum(1 for p in payments if p in html)
    if pay_count >= 2:
        score += 0.15
        reasons.append(f'{pay_count} payments')
    
    # License
    if any(lic in html for lic in ['mga', 'curacao', 'ukgc', 'gambling commission', 'spelinspektionen']):
        score += 0.1
        reasons.append('license info')
    
    # Check title
    title = page.title()
    is_review = any(w in title.lower() for w in ['review', 'best', 'top 10', 'compare', 'vs'])
    if is_review and 'casino' in title.lower():
        score -= 0.3  # Probably a review page
        reasons.append('review title detected')
    
    return score >= 0.5, score, reasons


def extract_info(page, url):
    info = {'url': url, 'casino_name': None, 'bonus': None}
    
    title = page.title()
    name = re.sub(r'\s*[-–|]\s*(Online Casino|Casino|Home|Official|Site).*$', '', title, flags=re.I)
    info['casino_name'] = name[:60]
    
    if not info['casino_name']:
        domain = urlparse(url).netloc.replace('www.', '')
        info['casino_name'] = domain.split('.')[0].title()
    
    html = page.content()
    bonus = re.search(r'(\d+%\s+(?:up to|bonus)\s+[€$£]\d+|\d+\s+free spins)', html, re.I)
    if bonus:
        info['bonus'] = bonus.group(1)[:80]
    
    return info


def make_slug(name):
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    slug = re.sub(r'-(casino|online|official)$', '', slug)
    return slug[:50]


def extract_casino_links(page, source_url, existing):
    """Extract outbound casino links from a page"""
    links = []
    seen = set()
    
    # Get all links
    elements = page.query_selector_all('a[href]')
    for el in elements:
        try:
            href = el.get_attribute('href')
            if not href or not href.startswith('http'):
                continue
            
            url = href.rstrip('/')
            domain = urlparse(url).netloc.lower().replace('www.', '')
            
            # Skip
            if should_skip(url):
                continue
            if url.lower() in existing['urls'] or domain in existing['domains']:
                continue
            if domain in seen:
                continue
            
            # Must look like a casino
            if not any(kw in domain for kw in ['casino', 'bet', 'slots', 'gaming', 'gamble', 'loko', 'win', 'spin']):
                continue
            
            # Skip tracking/redirect URLs
            if any(x in url.lower() for x in ['/track/', '/redirect/', '/aff/', '/go/', '/visit/', '/lp/']):
                continue
            
            seen.add(domain)
            links.append(url)
        except:
            pass
    
    return links[:15]


def main():
    print(f"[{datetime.utcnow().isoformat()}Z] Browser-based Casino Discovery")
    print("=" * 60)
    
    existing = load_existing()
    print(f"Loaded {len(existing['slugs'])} existing casinos")
    
    candidates = []
    checked = set()
    
    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800},
            locale='en-US',
        )
        
        for source in AGGREGATOR_SOURCES[:3]:
            print(f"\n🔍 {source['name']}")
            print(f"   {source['url']}")
            
            page = context.new_page()
            try:
                page.goto(source['url'], wait_until='domcontentloaded', timeout=30000)
                page.wait_for_timeout(3000)  # Wait for JS to render
                
                # Wait for content selector if specified
                if source.get('wait_for'):
                    try:
                        page.wait_for_selector(source['wait_for'], timeout=5000)
                    except:
                        pass
                
                # Extract casino links
                links = extract_casino_links(page, source['url'], existing)
                print(f"   Found {len(links)} potential casino links")
                
                for casino_url in links[:8]:
                    if casino_url in checked:
                        continue
                    checked.add(casino_url)
                    
                    print(f"\n   📄 {casino_url[:70]}")
                    
                    # Open in new tab
                    casino_page = context.new_page()
                    try:
                        casino_page.goto(casino_url, wait_until='domcontentloaded', timeout=15000)
                        casino_page.wait_for_timeout(2000)
                        
                        is_casino, score, reasons = detect_casino(casino_page, casino_url)
                        print(f"      Score: {score:.2f} ({', '.join(reasons)})")
                        
                        if is_casino:
                            info = extract_info(casino_page, casino_url)
                            slug = make_slug(info['casino_name'])
                            
                            if slug in existing['slugs']:
                                print(f"      ♻️  Already in DB")
                            else:
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
                        else:
                            print(f"      ❌ Not a casino")
                            
                    except PlaywrightTimeout:
                        print(f"      ⏱️  Timeout")
                    except Exception as e:
                        print(f"      ❌ Error: {str(e)[:50]}")
                    finally:
                        casino_page.close()
                        
            except PlaywrightTimeout:
                print(f"   ⏱️  Page timeout")
            except Exception as e:
                print(f"   ❌ Error: {str(e)[:80]}")
            finally:
                page.close()
        
        browser.close()
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 DISCOVERY COMPLETE")
    print(f"   ✅ New casinos: {len(candidates)}")
    print(f"   🔍 Checked: {len(checked)}")
    
    if candidates:
        print(f"\n   🎯 NEW CANDIDATES:")
        for c in candidates:
            print(f"      • {c['casino_name']}")
            print(f"        {c['url']}")
            print(f"        Score: {c['score']} | Bonus: {c.get('bonus', 'N/A')}")
    
    # Save
    output = {
        'candidates': candidates,
        'checked_count': len(checked),
        'timestamp': datetime.utcnow().isoformat() + 'Z',
    }
    with open('/tmp/discovery_browser.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n💾 Saved to /tmp/discovery_browser.json")
    return 0 if candidates else 1


if __name__ == '__main__':
    sys.exit(main())
