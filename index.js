const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 8080
const screenshot = require('./screenshot')

const whitelist = ['https://intweet.vercel.app/', 'http://localhost:3000']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.get('/', cors(corsOptions), (req, res) => res.status(200).json({ status: 'ok' }))

app.get('/screenshot', cors(corsOptions), (req, res) => {
  const url = req.query.url
  ;(async () => {
    const buffer = await screenshot(url)
    // res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.setHeader('Content-Type', 'application/json')
    res.send(buffer)
  })()
})

app.listen(port, () => console.log(`app listening on port ${port}!`))