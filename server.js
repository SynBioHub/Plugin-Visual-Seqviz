const express = require('express')

const fs = require('fs');
const path = require('path');
const request = require('request');
import hbs from "handlebars";
import compression from "compression";
import React from "react";
import ReactDOMServer from "react-dom/server";
import SeqViz from "./src/SeqViz/SeqViz.jsx";
import filesToParts from "./src/io/filesToParts";
import serialize from "serialize-javascript";

const app = express()
const port = 3000
const addr = "localhost"

app.use(express.json());
app.use(express.static("public"));

app.get('/Status', function (req, res) {
  res.status(200).send('The plugin is up and running')
})

app.post('/Evaluate', function (req, res) {
  res.status(200).send('The app can handle this input')
})

app.post('/Run', async (req, res) => {
  let url = req.body.complete_sbol.toString();
  console.log(url);
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
      <script type="text/javascript" src="http://${addr}:${port}/seqviz.js" charset="utf-8"></script>
      </body>
      </html>
      `;
      res.send(theHtml);
    }
  })
  // const fileName = path.join(
  //   __dirname,
  //   "src",
  //   "part_pIKE_Toggle_1.xml"
  // );
  // const fileContents = fs.readFileSync(fileName, "utf8");
  // const file = new File([fileContents], fileName, {
  //   type: "text/plain"
  // });
  // const hbsTemplate = hbs.compile(theHtml);
  // const reactComp = ReactDOMServer.renderToString(React.createElement(SeqViz,{ name:"J23100",
  // seq:"TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC",annotations:[{ name: "promoter", start: 0, end: 34, direction: 1 }]}));
  // console.log(reactComp);
  // const htmlToSend = hbsTemplate({ reactele: reactComp }); 
  // const parts = await filesToParts([fileContents], {
  //   fileName: fileName
  // });
  // console.log(parts);
  // const part = parts[0];
  // const defaultProps = {
  //   name: fileName,
  //   seq: part.seq,
  //   compSeq: part.compSeq,
  //   // annotations: [{
  //   //   name: "ann_1",
  //   //   start: 0,
  //   //   end: 10
  //   // }],
  //   style: {
  //     height: 600,
  //     width: 1000
  //   },
  //   size: {
  //     height: 400,
  //     width: 500
  //   }
  // };
  // const propdata = {
  //   file: fileContents,
  //   // fileName: 'part_pIKE_Toggle_1.xml'
  // }
  // const reactComp = ReactDOMServer.renderToString(React.createElement(SeqViz, {
  //   // ...defaultProps,
  //   ...propdata
  // }));

  // const theHtml = `<!doctype html>
  // <html>
  // <head><title>My First SSR</title></head>
  // <body>
  // <h1>My First Server Side Render</h1>
  // <div style="width:1000px;height:500px;">
  // <div id="reactele">${reactComp}</div>
  // </div>
  // <script type="text/javascript">window.__INITIAL_DATA__ = ${serialize(propdata)}</script>
  // <script type="text/javascript" src="http://${addr}:${port}/seqviz.js" charset="utf-8"></script>
  // </body>
  // </html>
  // `;
  // res.send(theHtml);
})

app.listen(port, () => console.log(`Example app listening at http://${addr}:${port}`))