const express = require('express')

const fs = require('fs');
const path = require('path');
const request = require('request');
const serialize = require("serialize-javascript");

const app = express()
const port = 5000
const addr = "localhost"

app.use(express.json());
//app.use(express.static("public"));

app.get('/seqviz.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'seqviz.js'));
})

app.get('/Status', function (req, res) {
  res.status(200).send('The plugin is up and running')
})

app.post('/Evaluate', function (req, res) {
  let type = req.body.type.toString();
  if (type === 'Component') {
    res.status(200).send('The app can handle this input');
  } else {
    res.status(404).end();
  }
})

app.post('/Run', async (req, res) => {
  let type = req.body.type.toString();
  if (type === 'Collection') res.status(404).end();
  else {
    let url = req.body.complete_sbol.toString();
    let hostAddr = req.get('host')
    request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var csv = body;

        const propdata = {
          style: {
            height: 600,
            width: 1000
          },
          size: {
            width: 500,
            height: 600
          },
          file: csv,
        }

        const theHtml = `<!doctype html>
                        <html>
                        <head><title>sequence view</title></head>
                        <body>
                        <div id="reactele"></div>
                        <script type="text/javascript">window.__INITIAL_DATA__ = ${serialize(propdata)}</script>
                        <script type="text/javascript" src="https://${hostAddr}/seqviz.js" charset="utf-8"></script>
                        </body>
                        </html>
                        `;
        res.send(theHtml);
      } else {
        console.log(error);
      }
    })
  }
})

app.listen(port, () => console.log(`Example app listening at http://${addr}:${port}`))