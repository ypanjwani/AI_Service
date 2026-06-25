import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })
await page.goto('http://localhost:5173')
await page.waitForLoadState('networkidle')
await page.waitForTimeout(800)

// Check for console errors
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })

await page.evaluate(() => window.scrollTo(0, 870))
await page.waitForTimeout(500)

// Simulate mouse move to trigger parallax
await page.mouse.move(900, 500)
await page.waitForTimeout(400)

await page.screenshot({ path: 'steps-geo.png' })
await browser.close()

if (errors.length) console.error('Errors:', errors)
else console.log('Done — no errors')
