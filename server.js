const express = require('express')

const fs = require('fs');
const path = require('path');
const request = require('request');
const serialize = require("serialize-javascript");

import filesToParts from "./io/filesToParts";
import {
  error
} from 'console';

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
  let url = req.body.complete_sbol.toString();
  let top_level = req.body.top_level.toString();
  let hostAddr = req.get('host');
  try {
    // Get SBOL file content string
    const csv = await getFileData(url);
    // parse SBOL file to get data for sequence view rendering
    const {
      displayList,
      parts
    } = await filesToParts(csv, {
      topLevel: top_level
    });

    const propdata = {
      style: {
        height: 600,
        width: 1100
      },
      size: {
        width: 500,
        height: 600
      },
      displayList: displayList,
      parts: parts,
    }

    const theHtml = `<!doctype html>
                    <html>
                      <head><title>sequence view</title></head>
                      <body>
                        <div id="reactele"></div>
                        <script type="text/javascript">window.__INITIAL_DATA__ = ${serialize(propdata)}</script>
                        <script type="text/javascript" src="https://${hostAddr}/seqviz.js" charset="utf-8"></script>
                      </body>
                    </html>`;
    res.send(theHtml);
  } catch (err) {
    const theHtml = `<!doctype html>
                    <html>
                      <head><title>sequence view</title></head>
                      <body>
                        <div id="reactele">
                        Error when parsing this file to get sequence data!
                        </div>
                      </body>
                    </html>`;
    res.send(theHtml);
  }
})

function getFileData(url) {
  return new Promise((resolve, reject) => {
    request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return resolve(body);
      } else {
        console.log('error:', error);
        return reject(error);
      }
    });
  })
}

app.listen(port, () => console.log(`Example app listening at http://${addr}:${port}`))