import sbolV3 from "./sbol.v3";
/**
 * takes in an SBOL file in v1 or v2 format, and parses to an array of parts
 * that match the Loom data model
 */
export default async (sbol, fileName, topLevel, colors = []) =>
  sbolV3(sbol, fileName, topLevel, colors);