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
    try{
        const screenshot = await takeScreenshot(url)
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
    await page.goto(url, { waitUntil: 'networkidle0' });
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