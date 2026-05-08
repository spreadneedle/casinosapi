#!/usr/bin/env python3
"""Fetch detailed casino info using Playwright for database entry."""

import json
from playwright.sync_api import sync_playwright

CASINOS = [
    {
        'slug': 'eagle-casino-sports',
        'url': 'https://playeagle.com',
        'name': 'Eagle Casino & Sports',
    },
    {
        'slug': 'casinocasino-com',
        'url': 'https://www.casinocasino.com',
        'name': 'CasinoCasino.com',
    },
]


def fetch_casino_info(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            viewport={'width': 1280, 'height': 800},
        )
        page = context.new_page()
        
        try:
            page.goto(url, wait_until='domcontentloaded', timeout=20000)
            page.wait_for_timeout(4000)
            
            html = page.content()
            title = page.title()
            
            # Extract bonus
            import re
            bonus = None
            patterns = [
                r'(\d+%\s+(?:up to|bonus)\s+[€$£]?\d[\d,]*)',
                r'(welcome bonus\s*:?\s*[€$£]?\d[\d,]*)',
                r'(\d+\s+free spins)',
                r'(?:bonus|offer)\s*:?\s*([€$£]?\d[\d,]*(?:\.\d+)?)',
            ]
            for pat in patterns:
                m = re.search(pat, html, re.I)
                if m:
                    bonus = m.group(0)[:80]
                    break
            
            # Extract license info
            licenses = []
            lic_patterns = ['mga', 'curacao', 'ukgc', 'spelinspektionen', 'gambling commission']
            for lic in lic_patterns:
                if lic in html.lower():
                    licenses.append(lic)
            
            # Check for sportsbook
            has_sports = bool(re.search(r'sport|betting|odds|sportsbook', html, re.I))
            
            # Check for live casino
            has_live = 'live casino' in html.lower()
            
            # Check Pay N Play
            has_paynplay = 'pay n play' in html.lower() or 'pay and play' in html.lower() or 'trustly' in html.lower()
            
            browser.close()
            
            return {
                'title': title,
                'bonus': bonus,
                'licenses': licenses,
                'has_sportsbook': has_sports,
                'has_live_casino': has_live,
                'has_pay_n_play': has_paynplay,
            }
            
        except Exception as e:
            browser.close()
            return {'error': str(e)}


for casino in CASINOS:
    print(f"\n{'='*60}")
    print(f"Fetching: {casino['name']}")
    print(f"URL: {casino['url']}")
    
    info = fetch_casino_info(casino['url'])
    print(json.dumps(info, indent=2))
