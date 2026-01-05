import os
import time
from playwright.sync_api import sync_playwright

def verify(page):
    # Navigate
    page.goto("http://localhost:3000", timeout=60000)

    # Bypass login
    page.evaluate("localStorage.setItem('fleet.token', 'test-token')")
    page.evaluate("localStorage.setItem('fleet.role', 'admin')")

    # Reload
    page.goto("http://localhost:3000", timeout=60000)

    # Wait for content (Dashboard text or specific element)
    # The dashboard usually has "Total Vehicles" or similar stats
    # Or just wait for network idle
    page.wait_for_load_state("networkidle")
    time.sleep(5) # Extra wait for map to render

    # Take screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/dashboard.png", full_page=True)
    print("Screenshot taken")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
