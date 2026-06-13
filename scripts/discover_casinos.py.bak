#!/usr/bin/env python3
"""
Auto-discovery for new casinos.
Searches Brave, validates candidates, auto-adds to database if legit.
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

# Search queries for discovery (rotate through these)
SEARCH_QUERIES = [
    "new online casino 2026",
    "best new crypto casino",
    "licensed online casino 2026",
    "new casino no deposit bonus",
    "new slot casino finland",
]

def load_existing_casinos():
    """Load current casino database to check for duplicates"""
    with open(BONUS_FILE) as f:
        content = f.read()
    start = content.index('[')
    end = content.rindex(']') + 1
    casinos = json.loads(content[start:end])
    
    # Build lookup sets
    urls = {c.get('url', '').lower().strip('/') for c in casinos if c.get('url')}
    names = {c['casino_name'].lower() for c in casinos}
    slugs = {c['slug'] for c in casinos}
    
    return {'casinos': casinos, 'urls': urls, 'names': names, 'slugs': slugs}

def search_brave(query, api_key):
    """Search Brave for casino candidates"""
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {"X-Subscription-Token": api_key}
    params = {"q": query, "count": 10}
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json().get('web', {}).get('results', [])
    except Exception as e:
        print(f"Brave search error: {e}")
        return []

def validate_url(url, timeout=10):
    """Check if URL is live and returns 200"""
    try:
        resp = requests.get(url, timeout=timeout, allow_redirects=True)
        return {
            'status_code': resp.status_code,
            'final_url': resp.url,
            'ok': resp.status_code == 200
        }
    except:
        return {'status_code': 0, 'final_url': url, 'ok': False}

def fetch_page_content(url, timeout=10):
    """Get page HTML for validation"""
    try:
        resp = requests.get(url, timeout=timeout, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; CasinosAPIBot/1.0)'
        })
        if resp.status_code == 200:
            return resp.text
        return None
    except:
        return None

def validate_casino_page(html, url):
    """
    Check if page looks like a real casino.
    Returns (is_valid, confidence, reason)
    """
    if not html:
        return False, 0, "Page unavailable"
    
    html_lower = html.lower()
    
    # Required: Casino keywords
    casino_keywords = ['casino', 'slots', 'bonus', 'bet', 'jackpot', 'gambling']
    keyword_count = sum(1 for kw in casino_keywords if kw in html_lower)
    if keyword_count < 2:
        return False, 0.1, "Missing casino keywords"
    
    # Good signal: Footer with legal stuff
    has_footer = 'footer' in html_lower or 'copyright' in html_lower
    has_terms = 'terms' in html_lower or 'privacy' in html_lower
    has_license = any(lic in html_lower for lic in ['curaçao', 'curacao', 'malta', 'mga', 'ukgc', 'license'])
    
    # Bad signals
    has_under_construction = 'under construction' in html_lower or 'coming soon' in html_lower
    has_parking = any(park in html_lower for park in ['parked domain', 'this domain', 'buy this domain'])
    excessive_ads = html_lower.count('<iframe') > 10 or html_lower.count('google-ad') > 5
    
    if has_parking or has_under_construction:
        return False, 0.2, "Parking/construction page"
    
    if excessive_ads:
        return False, 0.3, "Too many ads (spam site)"
    
    # Calculate confidence
    confidence = 0.4  # base for having keywords
    if has_footer: confidence += 0.15
    if has_terms: confidence += 0.15
    if has_license: confidence += 0.3
    
    # Check for basic quality signals
    if len(html) < 5000:  # Too short
        confidence -= 0.2
    
    is_valid = confidence >= 0.6
    reason = "Looks legit" if is_valid else f"Low confidence ({confidence:.2f})"
    
    return is_valid, confidence, reason

def extract_casino_info(url, html):
    """Extract casino name and bonus info from page"""
    info = {
        'url': url,
        'casino_name': None,
        'bonus': None,
        'description': None
    }
    
    if not html:
        return info
    
    # Try to extract casino name from <title> or <h1>
    title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
    if title_match:
        title = title_match.group(1).strip()
        # Clean up title (remove "- Online Casino" etc)
        title = re.sub(r'\s*[-–|]\s*(Online Casino|Casino|Slots).*', '', title, flags=re.IGNORECASE)
        info['casino_name'] = title[:60]  # Limit length
    
    # Fallback: use domain name
    if not info['casino_name']:
        domain = urlparse(url).netloc.replace('www.', '')
        info['casino_name'] = domain.split('.')[0].title()
    
    # Try to extract welcome bonus
    bonus_patterns = [
        r'(\d+%\s+(?:up to|bonus)\s+[€$£]\d+)',
        r'(welcome bonus[:\s]+[€$£]\d+)',
        r'(\d+\s+free spins)',
    ]
    
    for pattern in bonus_patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            info['bonus'] = match.group(1)[:100]
            break
    
    return info

def make_slug(name):
    """Generate slug from casino name"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

def main():
    # Load config
    brave_api_key = "BSAypcP2Nhj2cUpIjfALU_R8wMTtEDh"  # From your config
    
    print(f"[{datetime.utcnow().isoformat()}Z] Casino Auto-Discovery")
    print("=" * 60)
    
    # Load existing casinos
    existing = load_existing_casinos()
    print(f"Loaded {len(existing['casinos'])} existing casinos")
    
    # Results tracking
    candidates = []
    invalid = []
    duplicates = []
    
    # Search for new casinos
    for query in SEARCH_QUERIES[:2]:  # Limit to 2 queries to save API calls
        print(f"\nSearching: '{query}'...")
        results = search_brave(query, brave_api_key)
        print(f"  Found {len(results)} results")
        
        for result in results[:5]:  # Top 5 per query
            url = result.get('url', '')
            title = result.get('title', '')
            
            # Skip if obviously not a casino
            if not url or not any(kw in url.lower() + title.lower() for kw in ['casino', 'bet', 'slot']):
                continue
            
            # Normalize URL
            url = url.rstrip('/')
            url_clean = url.lower()
            
            # Check for duplicate
            if url_clean in existing['urls']:
                duplicates.append({'url': url, 'title': title})
                continue
            
            print(f"\n  Candidate: {title}")
            print(f"    URL: {url}")
            
            # Validate URL is live
            url_check = validate_url(url)
            if not url_check['ok']:
                print(f"    ❌ URL check failed ({url_check['status_code']})")
                invalid.append({
                    'url': url,
                    'title': title,
                    'reason': f"HTTP {url_check['status_code']}"
                })
                continue
            
            # Fetch and validate page content
            html = fetch_page_content(url)
            is_valid, confidence, reason = validate_casino_page(html, url)
            
            print(f"    Validation: {reason} (confidence: {confidence:.2f})")
            
            if not is_valid:
                print(f"    ❌ Validation failed")
                invalid.append({
                    'url': url,
                    'title': title,
                    'reason': reason,
                    'confidence': confidence
                })
                continue
            
            # Extract info
            info = extract_casino_info(url, html)
            slug = make_slug(info['casino_name'])
            
            # Check slug duplicate
            if slug in existing['slugs']:
                print(f"    ❌ Duplicate slug: {slug}")
                duplicates.append({'url': url, 'slug': slug})
                continue
            
            print(f"    ✅ Valid casino!")
            print(f"    Name: {info['casino_name']}")
            print(f"    Slug: {slug}")
            if info['bonus']:
                print(f"    Bonus: {info['bonus']}")
            
            candidates.append({
                **info,
                'slug': slug,
                'confidence': confidence,
                'title': title
            })
    
    # Summary
    print("\n" + "=" * 60)
    print(f"Discovery complete:")
    print(f"  Valid candidates: {len(candidates)}")
    print(f"  Invalid: {len(invalid)}")
    print(f"  Duplicates: {len(duplicates)}")
    
    # Output results
    output = {
        'candidates': candidates,
        'invalid': invalid,
        'duplicates': duplicates,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    
    print(json.dumps(output, indent=2))
    
    return 0 if len(candidates) > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
