import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser error: {err}"))

        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(2000)

        print("Clicking to start game...")
        await page.click("button#btn-start")
        await page.wait_for_timeout(2000)

        # Move forward (into a wall if we're near one, to test collisions)
        print("Moving forward (W)...")
        await page.keyboard.down("KeyW")
        await page.wait_for_timeout(3000)
        await page.keyboard.up("KeyW")

        # Move backward (S)
        print("Moving backward (S)...")
        await page.keyboard.down("KeyS")
        await page.wait_for_timeout(1000)
        await page.keyboard.up("KeyS")

        print("Taking final screenshot...")
        await page.screenshot(path="verify_final.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
