import path from "path";

import {
  COLORS
} from "../utils/colors";
import {
  dnaComplement,
  partFactory
} from "../utils/parser";
import parseSBOL from "./parsers/sbol";


/**
 * filesToParts can convert either string contents of
 * DNA files or a list of File objects into SeqViz parts
 */
export default async (
  files,
  options = {
    fileName: "",
    colors: COLORS,
    backbone: ""
  }
) => {
  try {
    const partLists = await new Promise((resolve, reject) => {
      const {
        fileName = "", colors = [], backbone = ""
      } = options;

      // if it's just a single file string
      if (typeof files === "string") {
        let parseresult = fileToParts(files, {
          fileName,
          colors,
          backbone
        })
        resolve(parseresult);
      }
    });

    return {
      'isRender': true,
      'displayList': partLists.displayList,
      'parts': partLists.partLists.reduce((acc, partList) => acc.concat(partList), [])
    };
  } catch (err) {
    return {
      'isRender': false
    }
  }
};

/**
 * Takes in a file, in string format, figures out which type of file it is,
 * converts the file into a part, and returns the part
 *
 * @param {String} file  the string representation of the passed file
 */
const fileToParts = async (
  file,
  options = {
    fileName: "",
    colors: [],
    backbone: ""
  }
) => {
  const {
    fileName = "", colors = [], backbone = ""
  } = options;

  if (!file) {
    throw Error("cannot parse null or empty string");
  }

  // this is a check for an edge case, where the user uploads come kind
  // of file that's full of bps but doesn't fit into a defined type
  const firstLine = file.search ? file.substring(0, file.search("\n")) : "";
  const dnaCharLength = firstLine.replace(/[^atcgATCG]/, "").length;
  const dnaOnlyFile = dnaCharLength / firstLine.length > 0.8; // is it >80% dna?
  const sourceName = fileName.split(path.sep).pop();
  const name =
    fileName && sourceName ?
    sourceName.substring(0, sourceName.search("\\.")) :
    "Untitled";
  const source = {
    name: sourceName,
    file: file
  };

  let parts;
  let displayLists;

  try {
    switch (true) {

      // SBOL
      case file.includes("RDF"):
        let {
          displayList, partLists
        } = await parseSBOL(file, fileName, colors);
        parts = partLists;
        displayLists = displayList;
        break;

        // a DNA text file without an official formatting
      case dnaOnlyFile:
        parts = [{
          ...partFactory(),
          ...dnaComplement(file),
          name
        }];
        break;

      default:
        throw Error(`${fileName} File type not recognized: ${file}`);
    }
  } catch (e) {
    console.error(e);
    return null;
  }

  // add the source information to all parts
  if (parts) {
    return {
      'displayList': displayLists,
      'partLists': parts.map(p => ({
        ...p,
        source
      }))
    };
  }
  throw Error("unparsable file");
};