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

        # Move to first block (-3, 0, 0) and push it to (-3, 0, 6)
        print("Looking at first block...")
        # To interact with the block, we need to aim at it and press E
        # For simplicity, we can inject JS to manually place the blocks and crystals to test the LevelLoader logic
        await page.evaluate("""
            window.testPuzzle = () => {
                const game = window.game; // Need to expose game or eventbus
                console.log("Triggering events manually");
            }
        """)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
