#!/usr/bin/env python3
"""Debug: Try different aggregator URLs"""

from playwright.sync_api import sync_playwright

URLS_TO_TRY = [
    'https://www.askgamblers.com/online-casinos',
    'https://chipy.com/casinos',
    'https://casino.guru/fi/uudet-nettikasinot',  # Finnish new casinos
    'https://www.casinotopp.net/uudet-nettikasinot/',  # Finnish
    'https://www.kasinohai.com/uudet-nettikasinot/',  # Finnish
    'https://www.casinot.net/uudet-kasinot/',  # Finnish
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport={'width': 1280, 'height': 800},
    )
    
    for url in URLS_TO_TRY:
        print(f"\n{'='*60}")
        print(f"URL: {url}")
        
        page = context.new_page()
        try:
            page.goto(url, wait_until='domcontentloaded', timeout=20000)
            page.wait_for_timeout(3000)
            
            print(f"Title: {page.title()[:60]}")
            print(f"Final URL: {page.url}")
            
            # Count links to external casino sites
            links = page.query_selector_all('a[href]')
            external = 0
            for link in links:
                href = link.get_attribute('href') or ''
                if href.startswith('http'):
                    domain = href.split('/')[2].replace('www.', '')
                    if domain not in url and 'google' not in domain and 'facebook' not in domain:
                        external += 1
            
            print(f"External links: {external}")
            
            # Show some sample links
            shown = 0
            for link in links:
                if shown >= 5:
                    break
                href = link.get_attribute('href') or ''
                text = (link.inner_text() or '').strip()
                if href.startswith('http'):
                    domain = href.split('/')[2].replace('www.', '')
                    if domain not in url and 'google' not in domain and 'facebook' not in domain:
                        print(f"  -> {text[:30]:30} | {href[:60]}")
                        shown += 1
                        
        except Exception as e:
            print(f"Error: {e}")
        finally:
            page.close()
    
    browser.close()
