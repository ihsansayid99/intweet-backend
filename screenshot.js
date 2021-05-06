const puppeteer = require('puppeteer')

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    ;(async () => {
      const browser = await puppeteer.launch({
        // headless: true, // debug only
        args: ['--no-sandbox']
      })

      const page = await browser.newPage()

      await page.goto(url, {
        waitUntil: ['load', 'networkidle0', 'domcontentloaded']
      })

      const buffer = await page.screenshot({
        fullPage: true,
        type: 'png',
        encoding: 'base64'
      })

      await browser.close()

      resolve(buffer)
    })()
  })
}