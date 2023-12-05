require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const URL = require("url").URL;

const urls = [];
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser())


app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const parseBody = (req, res, next) => {
  const url = req.body.url;
  if (!url) {
    res.json({
      error: "invalid url"
    })
    return;
  }
  
  const urlObject = new URL(url);
  dns.lookup(urlObject.hostname, (err, address, family) => {
    if (err){
      res.json({
        error: "invalid url"
      })
      return;
    } else {
      req.originalUrl = url;
      next();
    }
  })
  
}

app.post("/api/shorturl", parseBody, (req, res) => {

  const url = req.originalUrl;
  console.log(url)
  urls.push(url);
  res.json({
    original_url: url,
    short_url: urls.length-1
  })
})


app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  if (!shortUrl) {
    res.json({
      error: "invalid shortened url"
    });
    return;
  }

try {
   const original = urls[shortUrl];
   res.redirect(original);
} catch (error) {
  res.json({
    error: "invalid shortened url"
  });
}
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
