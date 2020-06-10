import fs from "fs";
import path from "path";

import React from 'react';
import ReactDOM from 'react-dom';

import filesToParts from "./io/filesToParts";
import { SeqViz } from "./viewer";
const fileName = path.join(
  __dirname,
  "part_pIKE_Toggle_1.xml"
);
const fileContents = require('./part_pIKE_Toggle_1.xml');
// import SeqViewer from "./SeqViz/SeqViewer";

const defaultProps = {
  name: "test_part",
  seq: "ATGGTAGTTAGATAGGGATACCGAT",
  annotations: [
    {
      name: "ann_1",
      start: 0,
      end: 10
    }
  ],
  style: { height: 200, width: 400 },
  size: { height: 200, width: 400 }
};
console.log(fileContents);
const file = new File([fileContents], fileName, { type: "text/plain" });
console.log(file);

ReactDOM.render(
  <SeqViz file={file} />,
  document.getElementById('root')
);