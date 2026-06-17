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
        # Since we use requestPointerLock on canvas inside startGame, we simulate clicking the menu
        await page.click("button#btn-start")
        await page.wait_for_timeout(2000)

        print("Pressing W to move forward...")
        await page.keyboard.down("KeyW")
        await page.wait_for_timeout(2000)
        await page.keyboard.up("KeyW")

        print("Taking screenshot...")
        await page.screenshot(path="verify_movement.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
