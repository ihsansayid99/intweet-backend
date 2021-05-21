/** require dependencies */
const express = require("express")
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const puppeteer = require("puppeteer")

const app = express()

let port = process.env.PORT || 8080

/** set up middlewares */
app.use(cors())
app.use(express.json({limit: '50mb'}))
app.use(helmet())

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.post('/api/screenshot', async (req, res, next) => {
    const { url } = req.body
    if (!req.body.url) {
        return res.end('Please specify url like this: ?url=example.com');
    }
    const splitTweetUrl = url.split('/')
    const lastItem = splitTweetUrl[splitTweetUrl.length - 1]
    const splitLastItem = lastItem.split('?')
    const tweetId = splitLastItem[0]
    try{
        const screenshot = await takeScreenshot(tweetId)
        // res.writeHead(200, {
        //     'Content-Type': 'application/json',
        //     'Content-Length': screenshot.length
        // })
        res.send({result: screenshot})
    }catch(err){
        res.end('error: ' + err.message)
    }
    // screenshot.then(response => {
    //     res.setHeader("Content-Type", "application/json");
    //     res.send({data: response})
    // })
    // res.send({result: screenshot })
    // next()    
})

async function takeScreenshot(url) {

    const browser = await puppeteer.launch({ 
       headless: true,
       args: ['--no-sandbox'] 
     });
    const page = await browser.newPage();
    await page.goto(`https://platform.twitter.com/embed/index.html?dnt=true&embedId=twitter-widget-0&frame=false&hideThread=false&id=${url}&lang=id&theme=light&widgetsVersion=ed20a2b%3A1601588405575`, { waitUntil: 'networkidle0' });
    const embedDefaultWidth = 550
    const percent = 1000 / embedDefaultWidth
    const pageWidth = embedDefaultWidth
    const pageHeight = 100
    await page.setViewport({ width: pageWidth, height: pageHeight, deviceScaleFactor: 2 })
    await page.evaluate(props => {
        const { percent } = props
  
        const style = document.createElement('style')
        style.innerHTML = "* { font-family: -apple-system, BlinkMacSystemFont, Ubuntu, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol' !important; }"
        document.getElementsByTagName('head')[0].appendChild(style)
  
        const body = document.querySelector('body')
        body.style.backgroundColor = '#fff'
        const articleWrapper = document.querySelector('#app > div')
        articleWrapper.style.border = 'none'
      }, ({ percent }))

    const screenShot = await page.screenshot({
        fullPage: true,
        type: 'png',
        encoding: 'base64'
    })

    await browser.close();
    return screenShot;
}

/** start server */
app.listen(port, () => {
    console.log(`Server started at port: ${port}`);
});
