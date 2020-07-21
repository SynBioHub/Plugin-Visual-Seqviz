import {
  partFactory,
  dnaComplement
} from "../../utils/parser";
import {
  annotationFactory
} from "../../utils/sequence";
import {
  chooseRandomColor
} from "../../utils/colors";
import randomid from "../../utils/randomid";
var SBOLDocument = require("sboljs");

export default async (sbol, fileName, colors = []) =>
  new Promise((resolve, reject) => {
    // util reject function that will be triggered if any fields fail
    const rejectSBOL = errType =>
      reject(new Error(`Failed on SBOLv2 file: ${errType}`));
    // weird edge case with directed quotation characters
    const fileString = sbol.replace(/“|”/g, '"');
    SBOLDocument.loadRDF(fileString, function (err, doc) {
      if (err) {
        rejectSBOL(err);
      }
      doc.componentDefinitions.forEach(function (componentDefinition) {
        console.log(componentDefinition)
      })
      // nothing in root
      resolve([]);
    })
  });