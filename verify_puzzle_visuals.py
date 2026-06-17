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

        # Let's forcefully place the block near the target using evaluate
        await page.evaluate("""
            const game = window;
            // The block is at -3, 0.5, 0. The target is at -3, 0, 6.
            // We can emit an event or move the block to trigger the check.
            const scene = window.scene; // Unfortunately we don't expose scene globally.
            // But we can dispatch a keydown to move the block. No, block moves by E raycast.
        """)

        # It's better to verify visuals manually with screenshot
        print("Taking visual check screenshot...")
        await page.screenshot(path="verify_puzzle_visuals.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
