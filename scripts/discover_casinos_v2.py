#!/usr/bin/env python3
"""
Improved auto-discovery for new casinos.

Key improvements over v1:
- Browser headers to avoid bot blocks
- Blacklist review/affiliate domains
- Detect actual casino functionality (login, games, payments)
- Skip aggregator/comparison sites
- Focus on operator sites, not review sites
"""

import json
import sys
import re
import requests
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
BONUS_FILE = REPO_ROOT / "api" / "bonus_enhanced.js"
URLS_FILE = REPO_ROOT / "casino_urls.json"

# Search queries - focus on finding actual casinos, not reviews
# Use -review -best -top to exclude review sites
SEARCH_QUERIES = [
    "new casino 2026 -review -best -top -vs -compare",
    "casino welcome bonus register -review -compare -affiliate",
    "crypto casino login register -review -best",
    "new pay n play casino 2026 -review -compare",
    "casino launch 2026 -news -review -compare",
    "intitle:casino inurl:login OR inurl:register -review",
    "new slot site 2026 -review -compare -best",
    "curacao casino new 2026 -review -compare",
]

# Domains to skip (review sites, aggregators, news)
BLACKLIST_DOMAINS = {
    'rotowire.com', 'usatoday.com', 'chipy.com', 'next.io',
    'cryptoslate.com', 'reddit.com', 'tokenist.com',
    'gambling.com', 'casino.org', 'askgamblers.com',
    'casinoguru.com', 'lcb.org', 'thepogg.com',
    'news.ycombinator.com', 'medium.com', 'quora.com',
    'youtube.com', 'twitter.com', 'x.com', 'facebook.com',
    'trustpilot.com', 'tripadvisor.com',
    'wikipedia.org', 'wikihow.com',
    'play.google.com', 'apps.apple.com',
}

# Browser-like headers to avoid bot blocks
BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,fi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
}


def load_existing_casinos():
    """Load current casino database to check for duplicates"""
    with open(BONUS_FILE) as f:
        content = f.read()
    start = content.index('[')
    end = content.rindex(']') + 1
    casinos = json.loads(content[start:end])
    
    urls = {c.get('url', '').lower().strip('/') for c in casinos if c.get('url')}
    names = {c['casino_name'].lower() for c in casinos}
    slugs = {c['slug'] for c in casinos}
    domains = {urlparse(u).netloc.replace('www.', '') for u in urls}
    
    return {
        'casinos': casinos,
        'urls': urls,
        'names': names,
        'slugs': slugs,
        'domains': domains,
    }


def is_blacklisted(url):
    """Check if URL is from a blacklisted domain"""
    domain = urlparse(url).netloc.lower()
    domain = domain.replace('www.', '')
    
    for blacklisted in BLACKLIST_DOMAINS:
        if blacklisted in domain or domain in blacklisted:
            return True
    
    # Skip obvious review paths
    path = urlparse(url).path.lower()
    review_patterns = ['/review', '/best-', '/top-', '/compare', '/vs-', '/versus']
    for pattern in review_patterns:
        if pattern in path:
            return True
    
    return False


def search_brave(query, api_key, count=10):
    """Search Brave for casino candidates"""
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {
        "X-Subscription-Token": api_key,
        "Accept": "application/json",
    }
    params = {"q": query, "count": count, "offset": 0}
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get('web', {}).get('results', [])
    except Exception as e:
        print(f"    Brave search error: {e}")
        return []


def check_url(url, timeout=10):
    """Check if URL is live with browser headers"""
    try:
        resp = requests.get(
            url,
            headers=BROWSER_HEADERS,
            timeout=timeout,
            allow_redirects=True,
        )
        return {
            'status_code': resp.status_code,
            'final_url': resp.url,
            'ok': resp.status_code == 200,
            'headers': dict(resp.headers),
        }
    except requests.exceptions.Timeout:
        return {'status_code': 0, 'final_url': url, 'ok': False, 'error': 'timeout'}
    except requests.exceptions.SSLError:
        return {'status_code': 0, 'final_url': url, 'ok': False, 'error': 'ssl_error'}
    except Exception as e:
        return {'status_code': 0, 'final_url': url, 'ok': False, 'error': str(e)[:50]}


def fetch_page(url, timeout=15):
    """Get page HTML with browser headers"""
    try:
        resp = requests.get(url, headers=BROWSER_HEADERS, timeout=timeout)
        if resp.status_code == 200:
            return resp.text
        return None
    except:
        return None


def detect_casino_type(html, url):
    """
    Detect if page is an actual casino operator site vs review/aggregator.
    Returns (is_casino, confidence, reasons)
    """
    if not html:
        return False, 0, ["No HTML content"]
    
    html_lower = html.lower()
    reasons = []
    score = 0
    
    # === NEGATIVE SIGNALS (review sites) ===
    
    # Multiple casinos listed on one page = review site
    casino_listings = html_lower.count('href=') > 0 and (
        html_lower.count('casino') > 10 or
        html_lower.count('bonus') > 15
    )
    
    # Comparison tables
    has_comparison = 'comparison' in html_lower or 'vs' in html_lower or 'compare' in html_lower
    
    # Review-specific language
    review_words = ['reviewed by', 'our experts', 'we tested', 'our rating', 
                    'editorial team', 'methodology', 'how we rank']
    review_count = sum(1 for w in review_words if w in html_lower)
    
    # Affiliate disclaimer
    has_affiliate = 'affiliate' in html_lower or 'commission' in html_lower
    
    # News/blog format
    is_news = '/news/' in url.lower() or '/blog/' in url.lower() or '/article/' in url.lower()
    
    if review_count >= 2 or has_comparison or (has_affiliate and casino_listings):
        return False, 0, ["Review/affiliate site detected"]
    
    if is_news and not any(kw in url.lower() for kw in ['casino.', 'bet.', 'slots.']):
        return False, 0, ["News/article page"]
    
    # === POSITIVE SIGNALS (actual casino) ===
    
    # 1. Login/Register buttons (strong signal)
    login_patterns = [
        r'>(login|sign in|log in)<',
        r'>(register|sign up|join now|create account)<',
        r'class="[^"]*(?:login|register|signin|signup)[^"]*"',
        r'href="[^"]*(?:login|register|sign-up)[^"]*"',
    ]
    login_matches = sum(1 for p in login_patterns if re.search(p, html_lower))
    if login_matches >= 2:
        score += 0.3
        reasons.append("Has login/register")
    
    # 2. Game categories (strong signal)
    game_cats = ['slots', 'live casino', 'table games', 'jackpots', 
                 'roulette', 'blackjack', 'poker', 'baccarat']
    game_cat_count = sum(1 for cat in game_cats if cat in html_lower)
    if game_cat_count >= 3:
        score += 0.25
        reasons.append(f"Has {game_cat_count} game categories")
    
    # 3. Payment methods
    payment_methods = ['visa', 'mastercard', 'paypal', 'skrill', 'neteller',
                       'bitcoin', 'crypto', 'trustly', 'paysafecard',
                       'apple pay', 'google pay', 'bank transfer']
    payment_count = sum(1 for p in payment_methods if p in html_lower)
    if payment_count >= 2:
        score += 0.15
        reasons.append(f"Has {payment_count} payment methods")
    
    # 4. Game providers (strong signal for real casino)
    providers = ['netent', 'microgaming', 'play\'n go', 'pragmatic play',
                 'evolution', 'red tiger', 'yggdrasil', 'quickspin',
                 'big time gaming', 'push gaming', 'relax gaming']
    provider_count = sum(1 for p in providers if p in html_lower)
    if provider_count >= 2:
        score += 0.2
        reasons.append(f"Has {provider_count} game providers")
    
    # 5. Licensing info
    licenses = ['mga', 'ukgc', 'curacao', 'spelinspektionen', 'gambling commission']
    has_license = any(lic in html_lower for lic in licenses)
    if has_license:
        score += 0.1
        reasons.append("Has license info")
    
    # 6. Casino platform patterns
    platforms = ['white hat gaming', 'aspire global', 'skill on net',
                 'everymatrix', 'softswiss', 'betconstruct']
    has_platform = any(p in html_lower for p in platforms)
    if has_platform:
        score += 0.15
        reasons.append("Uses known casino platform")
    
    # 7. Bad signals
    if 'under construction' in html_lower or 'coming soon' in html_lower:
        score -= 0.3
        reasons.append("Under construction")
    
    if any(park in html_lower for park in ['parked domain', 'this domain is', 'buy this domain']):
        score -= 0.5
        reasons.append("Parked domain")
    
    # Minimum content size
    if len(html) < 3000:
        score -= 0.2
        reasons.append("Page too small")
    
    is_casino = score >= 0.5
    return is_casino, score, reasons


def extract_casino_info(html, url):
    """Extract casino name, bonus, and description from page"""
    info = {
        'url': url,
        'casino_name': None,
        'bonus': None,
        'description': None,
    }
    
    if not html:
        return info
    
    # Extract name from title
    title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
    if title_match:
        title = title_match.group(1).strip()
        # Clean up common suffixes
        title = re.sub(r'\s*[-–|]\s*(Online Casino|Casino|Home|Official|Site).*$', '', 
                      title, flags=re.IGNORECASE)
        info['casino_name'] = title[:60]
    
    # Fallback to domain
    if not info['casino_name']:
        domain = urlparse(url).netloc.replace('www.', '')
        info['casino_name'] = domain.split('.')[0].title()
    
    # Extract bonus
    bonus_patterns = [
        r'welcome bonus.*?([€$£]\d+[\d,]*(?:\.\d+)?)',
        r'(\d+%\s+(?:up to|bonus)\s+[€$£]\d+[\d,]*)',
        r'(\d+\s+free spins)',
        r'bonus\s+([€$£]\d+[\d,]*(?:\.\d+)?)',
    ]
    
    for pattern in bonus_patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            info['bonus'] = match.group(0)[:80]
            break
    
    # Extract meta description
    desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', 
                          html, re.IGNORECASE)
    if desc_match:
        info['description'] = desc_match.group(1)[:200]
    
    return info


def extract_casino_links_from_review(html, source_url, existing):
    """Extract casino URLs from a review/affiliate page"""
    if not html:
        return []
    
    found = []
    source_domain = urlparse(source_url).netloc
    
    # Find all outbound links
    link_pattern = r'href=["\'](https?://[^"\']+)["\']'
    links = re.findall(link_pattern, html)
    
    for link in links:
        link_lower = link.lower()
        domain = urlparse(link).netloc.replace('www.', '')
        
        # Skip same domain, blacklisted, already in DB
        if domain in source_domain:
            continue
        if is_blacklisted(link):
            continue
        if link.lower().rstrip('/') in existing['urls']:
            continue
        if domain in existing['domains']:
            continue
        
        # Skip non-casino links
        if not any(kw in link_lower for kw in ['casino', 'bet', 'slots', 'gaming', 'gamble']):
            continue
        
        # Skip tracking/affiliate redirect URLs
        if any(x in link_lower for x in ['/track/', '/redirect/', '/aff/', '/go/', '/visit/']):
            continue
        
        # Skip image/assets
        if any(link_lower.endswith(ext) for ext in ['.jpg', '.png', '.css', '.js']):
            continue
        
        found.append((link, domain))
    
    # Deduplicate by domain
    seen = set()
    unique = []
    for url, domain in found:
        if domain not in seen:
            seen.add(domain)
            unique.append((url, domain))
    
    return unique[:10]  # Return top 10


def make_slug(name):
    """Generate URL-safe slug from casino name"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    # Remove common suffixes
    slug = re.sub(r'-(casino|online|official|site)$', '', slug)
    return slug[:50]


def main():
    brave_api_key = "BSAypcP2Nhj2cUpIjfALU_R8wMTtEDh"
    
    print(f"[{datetime.utcnow().isoformat()}Z] Casino Auto-Discovery v2")
    print("=" * 60)
    
    existing = load_existing_casinos()
    print(f"Loaded {len(existing['casinos'])} existing casinos")
    print(f"Blacklisted domains: {len(BLACKLIST_DOMAINS)}")
    
    candidates = []
    invalid = []
    duplicates = []
    blocked_count = 0
    
    for query in SEARCH_QUERIES[:3]:  # Limit to save API calls
        print(f"\n🔍 Searching: '{query}'")
        results = search_brave(query, brave_api_key, count=10)
        print(f"   Found {len(results)} results")
        
        for result in results[:6]:  # Top 6 per query
            url = result.get('url', '').rstrip('/')
            title = result.get('title', '')
            desc = result.get('description', '')
            
            if not url:
                continue
            
            print(f"\n   📄 {title[:60]}")
            print(f"      URL: {url[:80]}")
            
    # Check blacklist (but still extract links from review sites)
            is_review = is_blacklisted(url)
            if is_review:
                print(f"      ⚠️  Review site - extracting casino links")
            
            # Check duplicate
            url_clean = url.lower()
            domain = urlparse(url).netloc.replace('www.', '')
            if url_clean in existing['urls'] or domain in existing['domains']:
                print(f"      ♻️  Already in database")
                duplicates.append({'url': url, 'title': title})
                continue
            
            # Check URL is live
            url_check = check_url(url)
            if not url_check['ok']:
                err = url_check.get('error', f"HTTP {url_check['status_code']}")
                print(f"      ❌ URL failed: {err}")
                invalid.append({'url': url, 'title': title, 'reason': err})
                if url_check['status_code'] == 403:
                    blocked_count += 1
                continue
            
            # Fetch and validate page
            print(f"      📥 Fetching page...")
            html = fetch_page(url)
            
            # If review site, extract casino links from it
            if is_review and html:
                extracted = extract_casino_links_from_review(html, url, existing)
                if extracted:
                    print(f"      🔗 Extracted {len(extracted)} casino links from review")
                    for casino_url, casino_title in extracted[:3]:  # Check top 3
                        print(f"\n         Checking extracted: {casino_url[:60]}")
                        # Quick check
                        check = check_url(casino_url)
                        if not check['ok']:
                            print(f"         ❌ URL failed")
                            continue
                        
                        casino_html = fetch_page(casino_url)
                        is_cas, conf, reas = detect_casino_type(casino_html, casino_url)
                        print(f"         Score: {conf:.2f}")
                        
                        if is_cas:
                            info = extract_casino_info(casino_html, casino_url)
                            slug = make_slug(info['casino_name'])
                            if slug not in existing['slugs']:
                                print(f"         ✅ NEW CASINO: {info['casino_name']}")
                                candidates.append({
                                    **info,
                                    'slug': slug,
                                    'confidence': round(conf, 2),
                                    'reasons': reas,
                                    'source': f'Extracted from {domain}',
                                })
                continue
            
            is_casino, confidence, reasons = detect_casino_type(html, url)
            
            print(f"      Score: {confidence:.2f} - {', '.join(reasons[:3])}")
            
            if not is_casino:
                print(f"      ❌ Not a casino operator site")
                invalid.append({
                    'url': url,
                    'title': title,
                    'reason': f"Score {confidence:.2f}: {', '.join(reasons[:2])}"
                })
                continue
            
            # Extract info
            info = extract_casino_info(html, url)
            slug = make_slug(info['casino_name'])
            
            if slug in existing['slugs']:
                print(f"      ♻️  Duplicate slug: {slug}")
                duplicates.append({'url': url, 'slug': slug})
                continue
            
            print(f"      ✅ NEW CASINO FOUND!")
            print(f"         Name: {info['casino_name']}")
            print(f"         Slug: {slug}")
            if info['bonus']:
                print(f"         Bonus: {info['bonus']}")
            
            candidates.append({
                **info,
                'slug': slug,
                'confidence': round(confidence, 2),
                'reasons': reasons,
                'search_query': query,
            })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 DISCOVERY COMPLETE")
    print(f"   ✅ New casinos: {len(candidates)}")
    print(f"   ❌ Invalid: {len(invalid)} (bot blocked: {blocked_count})")
    print(f"   ♻️  Duplicates: {len(duplicates)}")
    
    if candidates:
        print(f"\n   🎯 NEW CANDIDATES:")
        for c in candidates:
            print(f"      • {c['casino_name']} ({c['url']})")
            print(f"        Score: {c['confidence']} | Bonus: {c.get('bonus', 'N/A')}")
    
    # Save results
    output = {
        'candidates': candidates,
        'invalid': invalid,
        'duplicates': duplicates,
        'stats': {
            'blocked_by_bot': blocked_count,
            'total_checked': len(candidates) + len(invalid) + len(duplicates),
        },
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    
    with open('/tmp/discovery_results_v2.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n💾 Saved to /tmp/discovery_results_v2.json")
    return 0 if candidates else 1


if __name__ == '__main__':
    sys.exit(main())
