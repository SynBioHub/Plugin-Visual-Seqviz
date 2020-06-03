const express = require('express')

const fs = require('fs');
const path = require('path');
import hbs from "handlebars";
import compression from "compression";
import React from "react";
import ReactDOMServer from "react-dom/server";
import SeqViz from "./src/SeqViz/SeqViz.jsx";
import serialize from "serialize-javascript";

const app = express()
const port = 3000

app.use(express.static("public"));

app.get('/', (req, res) => {
  // SBOL file read has some unsolved issue
  // const fileName = path.join(
  //   __dirname,
  //   "src",
  //   "io",
  //   "examples",
  //   "sbol",
  //   "v2",
  //   "A1.xml"
  // );
  // const fileContents = fs.readFileSync(fileName, "utf8");
  // const file = new File([fileContents], fileName, { type: "text/plain" });
  // const hbsTemplate = hbs.compile(theHtml);
  // const reactComp = ReactDOMServer.renderToString(React.createElement(SeqViz,{ name:"J23100",
  // seq:"TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC",annotations:[{ name: "promoter", start: 0, end: 34, direction: 1 }]}));
  // console.log(reactComp);
  // const htmlToSend = hbsTemplate({ reactele: reactComp });
  const defaultProps = {
    name: "test_part",
    seq: "ATGGTAGTTAGATAGGGATACCGAT",
    annotations: [{
      name: "ann_1",
      start: 0,
      end: 10
    }],
    style: {
      height: 600,
      width: 1000
    },
    size: {
      height: 400,
      width: 500
    }
  };
  const reactComp = ReactDOMServer.renderToString(React.createElement(SeqViz, {
    ...defaultProps
  }));

  const theHtml = `<!doctype html>
  <html>
  <head><title>My First SSR</title></head>
  <body>
  <h1>My First Server Side Render</h1>
  <div style="width:1000px;height:500px;">
  <div id="reactele">${reactComp}</div>
  </div>
  <script>window.__INITIAL_DATA__ = ${serialize(defaultProps)}</script>
  <script src="/seqviz.js" charset="utf-8"></script>
  </body>
  </html>
  `;
  res.send(theHtml);
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))