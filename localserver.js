const express = require('express')

const path = require('path');
const request = require('request');
const serialize = require("serialize-javascript");

import filesToParts from "./io/filesToParts";

const app = express()
const port = 5050
const addr = "localhost"

app.use(express.json());
//app.use(express.static("public"));

app.get('/seqviz.js', function (req, res) {
  console.log('seqviz.js')
  res.sendFile(path.join(__dirname, 'public', 'seqviz.js'));
})

app.get('/Status', function (req, res) {
  console.log('Status')
  res.status(200).send('The plugin is up and running')
})

app.post('/Evaluate', function (req, res) {
  let type = req.body.type.toString();
  console.log('evaluate ' + type)
  if (type === 'Component' || type === 'ComponentDefinition') {
    res.status(200).send('The app can handle this input');
  } else {
    res.status(404).end();
  }
})

app.post('/Run', async (req, res) => {
  let url = req.body.complete_sbol.toString();
  let top_level = req.body.top_level.toString();
  let hostAddr = req.get('host');
  console.log('run url=' + url + ' top=' + top_level + ' hostAddr=' + hostAddr)
  try {
    // Get SBOL file content string
    let csv;
    if(req.body.token) {
      csv = await getFileData(url, req.body.token);
    }
    else {
      csv = await getFileData(url);
    }
    
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
                        <script type="text/javascript" src="http://${hostAddr}/seqviz.js" charset="utf-8"></script>
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

function getFileData(url, token=null) {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      headers: {}
    };
    if (token) {
      options.headers['X-authorization'] = token;
      console.log('getFileData with token')
    }
    request.get(options, function (error, response, body) {
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