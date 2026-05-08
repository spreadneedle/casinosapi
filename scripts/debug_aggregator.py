#!/usr/bin/env python3
"""Debug: See what aggregator pages actually contain"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport={'width': 1280, 'height': 800},
    )
    
    page = context.new_page()
    
    # Test AskGamblers
    print("=== AskGamblers ===")
    page.goto('https://www.askgamblers.com/online-casinos/newest', wait_until='domcontentloaded', timeout=30000)
    page.wait_for_timeout(5000)
    
    print(f"Title: {page.title()}")
    print(f"URL: {page.url}")
    
    # Get all links
    links = page.query_selector_all('a[href]')
    print(f"Total links: {len(links)}")
    
    # Show first 20 links with text
    for i, link in enumerate(links[:30]):
        href = link.get_attribute('href') or ''
        text = link.inner_text() or ''
        if href.startswith('http') and 'askgamblers' not in href:
            print(f"  {text[:40]:40} -> {href[:80]}")
    
    # Check if there are casino items
    casino_items = page.query_selector_all('[class*="casino"], [class*="Casino"], [data-testid*="casino"]')
    print(f"\nCasino items found: {len(casino_items)}")
    
    browser.close()
