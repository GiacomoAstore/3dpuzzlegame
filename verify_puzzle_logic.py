import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(2000)

        print("Clicking to start game...")
        await page.click("button#btn-start")
        await page.wait_for_timeout(2000)

        # Let's forcefully increment crystals and blocks via HUD just to see what the HUD shows
        await page.evaluate("""
            const game = window;
            // Hack to manually dispatch completion to test HUD
            const ev = new CustomEvent('keydown');
            ev.code = 'KeyE';
            document.dispatchEvent(ev);
        """)

        # Capture screenshot to see HUD modifications
        print("Taking logic check screenshot...")
        await page.screenshot(path="verify_puzzle_logic.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
