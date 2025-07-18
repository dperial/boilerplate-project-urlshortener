require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlParse = require('url');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
// Temporary in-memory storage for URLs
let urlDatabase = {};
let idCounter = 1;
// API endpoint for shortening URLs
app.post('/api/shorturl', function (req, res) {
  const inputUrl = req.body.url;

  // ✅ Must begin with http:// or https://
  if (!/^https?:\/\//.test(inputUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const parsedUrl = new URL(inputUrl);

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' }); // ✅ Must be lowercase and no status code
      }

      const shortUrl = idCounter++;
      urlDatabase[shortUrl] = inputUrl;

      res.json({
        original_url: inputUrl,
        short_url: shortUrl,
      });
    });
  } catch (e) {
    return res.json({ error: 'invalid url' }); // ✅ Must be lowercase
  }
});

  // GET endpoint to retrieve the original URL from the short URL
  app.get('/api/shorturl/:short_url', function(req, res) {
    const shortUrl = parseInt(req.params.short_url);
    const originalUrl = urlDatabase[shortUrl];
    if (originalUrl) {
      res.redirect(originalUrl);
    } else {
      res.status(404).json({ error: 'Short URL not found' });
    }
  });
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
