import React from 'react';
import ReactDOM from 'react-dom';

import fs from "fs";
import path from "path";

import {
  Viewer
} from "./viewer";
import filesToParts from "./io/filesToParts";
// import App from './App';
// import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));

// serviceWorker.unregister();
const fileContents = require('./BBa_I0462.xml');

// var fileContents=fs.readFileSync(path.join(__dirname, 'part_pIKE_Toggle_1.xml'),'utf8')
const defaultOptions = {
  viewer: "both",
  showAnnotations: true,
  showPrimers: true,
  showComplement: true,
  showIndex: true,
  zoom: {
    linear: 50
  },
  bpColors: {
    A: "#FFF"
  },
  colors: [],
  onSelection: () => {},
  onSearch: () => {},
  search: {
    query: "GCGG"
  },
  backbone: "",
  enzymes: [],
  annotations: [{
    name: "test_annotation",
    start: 0,
    end: 15,
    direction: "FORWARD" // old prop-type, still supported; now using -1, 0, 1
  }],
  style: {
    height: 500,
    width: 800
  }
};
// const parts = filesToParts([fileContents], {
//   fileName: fileName
// });
// const part = parts[0];
// const file = new File([fileContents], fileName, { type: "text/plain" });

const div = document.getElementById('root');
let viewer = Viewer(div,
  // name: "seq_name",
  // seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca",
  // style: { height: 500, width: 800 },
  // enzymes: [],
  // annotations: [
  //   {
  //     name: "test_annotation",
  //     start: 0,
  //     end: 15,
  //     direction: "FORWARD" // old prop-type, still supported; now using -1, 0, 1
  //   }
  // ],
  {
    ...defaultOptions,
    file: JSON.stringify(fileContents),
    fileName: 'BBa_I0462.xml'
  },
);

viewer.render();