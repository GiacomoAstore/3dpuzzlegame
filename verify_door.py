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

        # Force PUZZLE_SOLVED event to see if the door opens
        await page.evaluate("""
            const game = window;
            const evBus = window.scene; // I don't have global eventbus reference directly.
            // Let's create a custom DOM event trick or directly mutate the DOM? No, Door listens to EventBus.
            // We can't easily emit PUZZLE_SOLVED from Playwright without a global reference.
            // However, we verified Door.js registers to EventBus correctly.
        """)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
