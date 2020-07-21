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
import {
  sequenceOntology
} from "../sequence-ontology";
import xml2js, {
  processors
} from "xml2js";

/**
 * SBOL v2.0 schema definition can be found at: http://sbolstandard.org/wp-content/uploads/2016/06/SBOL-data-model-2.2.1.pdf
 * differs from SBOL 1 in that the ComponentDefinitions are like the root parts,
 * and the sequence and annotations are separated (they're no longer defined relationally
 * by nesting but, instead, by id)
 *
 * we only care about components that have sequence information
 */

// get the first string/number child out of an array of possible null elements
const first = elArr => {
  if (elArr && elArr[0] && elArr[0]._) {
    return elArr[0]._;
  }
  return null;
};

/**
 * takes an SBOL file, as a string, and converts it into our DB
 * representation of a part(s). an example of this type of file can be
 * found in ../examples/j5.SBOL.xml
 */
export default async (sbol, fileName, colors = []) =>
  new Promise((resolve, reject) => {
    // util reject function that will be triggered if any fields fail
    const rejectSBOL = errType =>
      reject(new Error(`Failed on SBOLv2 file: ${errType}`));

    // weird edge case with directed quotation characters
    const fileString = sbol.replace(/“|”/g, '"');

    xml2js.parseString(
      fileString, {
        xmlns: true,
        attrkey: "xml_tag",
        tagNameProcessors: [processors.stripPrefix]
      },
      (err, parsedSBOL) => {
        if (err) {
          rejectSBOL(err);
        }

        let RDF = null;
        if (parsedSBOL.RDF) {
          ({
            RDF
          } = parsedSBOL);
        }

        if (!RDF) {
          reject(new Error("No root RDF document"));
        }

        // check if anything is defined, return if not
        const {
          ComponentDefinition,
          Sequence
        } = RDF;
        if (!ComponentDefinition || !ComponentDefinition.length || !Sequence) {
          resolve([]);
        }

        // it's a collection of DnaComponents, parse each to a part
        const partList = [];
        ComponentDefinition.forEach((c, i) => {
          // we're only making parts out of those with seq info
          if (!c.sequence || !c.sequence.length) {
            return;
          }

          const {
            displayId,
            title,
            description,
            sequence,
            sequenceAnnotation,
            component
          } = c;
          const name = first(title) || first(displayId) || `${fileName}_${i + 1}`;
          const note = first(description) || "";

          if (component) {
            const components = component.map((Components) => Components.Component.map((com) => com));
            const componentarr = [].concat.apply([], components);
          }

          const annotations = [];
          (sequenceAnnotation || []).forEach(({
            SequenceAnnotation
          }) => {
            SequenceAnnotation.forEach((SequenceAnnotation) => {
              const ann = SequenceAnnotation;
              var annName = first(ann.title) || first(ann.displayId);
              const Location = ann.location;
              const color = chooseRandomColor();
              const annId = randomid();
              if (SequenceAnnotation.role) {
                var roles = SequenceAnnotation.role;
              } else {
                var roles = [];
              }
              var uri = '';

              var tooltip = '';

              // If it is a component
              if (ann.component && ann.component.length) {
                tooltip = 'Component\n'
                const componentRes = ann.component[0].xml_tag["rdf:resource"].value;
                const linkedComponent = componentarr.find(
                  com => com.xml_tag["rdf:about"].value === componentRes
                );
                const linkedComponentres = linkedComponent.definition[0].xml_tag["rdf:resource"].value;
                const linkedComponentDef = ComponentDefinition.find(com => com.xml_tag["rdf:about"].value === linkedComponentres)
                if (linkedComponentDef) {
                  uri = linkedComponentDef.persistentIdentity[0].xml_tag["rdf:resource"].value;
                  annName = first(linkedComponentDef.title) || first(linkedComponentDef.displayId);
                  roles = roles.concat(linkedComponentDef.role);
                  if (first(linkedComponentDef.displayId)) {
                    tooltip += 'Identifier: ' + first(linkedComponentDef.displayId) + '\n';
                  }
                  if (first(linkedComponentDef.title)) {
                    tooltip += 'Name: ' + first(linkedComponentDef.title) + '\n';
                  }
                  if (first(linkedComponentDef.description)) {
                    tooltip += 'Description: ' + first(linkedComponentDef.description) + '\n';
                  }
                }
              } else {
                tooltip = 'Feature\n'
                if (first(ann.displayId)) tooltip += 'Identifier: ' + first(ann.displayId) + '\n';
                if (first(ann.title)) tooltip += 'Name: ' + first(ann.title) + '\n';
                if (first(sequenceAnnotation.description)) tooltip += 'Description: ' + first(sequenceAnnotation.description) + '\n';
              }

              if (roles.length > 0) {
                roles.forEach((role) => {
                  role = role.xml_tag["rdf:resource"].value;
                  var igemPartPrefix = 'http://wiki.synbiohub.org/wiki/Terms/igem#partType/';
                  var igemFeaturePrefix = 'http://wiki.synbiohub.org/wiki/Terms/igem#feature/';
                  var soPrefix = 'http://identifiers.org/so/';
                  if (role.indexOf(igemPartPrefix) === 0) {
                    tooltip += 'iGEM Part Type: ' + role.slice(igemPartPrefix.length) + '\n';
                  } else if (role.indexOf(igemFeaturePrefix) === 0) {
                    tooltip += 'iGEM Feature Type: ' + role.slice(igemFeaturePrefix.length) + '\n';
                  } else if (role.indexOf(soPrefix) === 0) {
                    var soTerm = role.slice(soPrefix.length).split('_').join(':');
                    var role = soTerm;
                    if (sequenceOntology[soTerm]) {
                      role = sequenceOntology[soTerm].name
                    }
                    tooltip += 'Role: ' + role + '\n';
                  }
                })
              }

              const ranges = Location.map(location => location.Range.map(range => range));
              const rangesarr = [].concat.apply([], ranges);
              console.log(rangesarr);

              Location.forEach((location) => {
                const {
                  Range
                } = location;
                Range.forEach((range) => {
                  annotations.push({
                    ...annotationFactory(annName),
                    annId: annId,
                    name: annName,
                    color: color,
                    start: first(range.start) - 1,
                    end: first(range.end)
                  });
                })
              })
            })
            // const ann = SequenceAnnotation[0];
            // const annId = first(ann.title) || first(ann.displayId);
            // const {
            //   Range
            // } = ann.location[0];

            // const range = Range[0];
            // annotations.push({
            //   ...annotationFactory(annId),
            //   name: annId,
            //   start: first(range.start) - 1,
            //   end: first(range.end)
            // });
          });

          const seqID = sequence[0].xml_tag["rdf:resource"].value;

          // try and find sequence data
          const partSeq = Sequence.find(
            s =>
            (s.persistentIdentity &&
              s.persistentIdentity.length &&
              s.persistentIdentity[0].xml_tag["rdf:resource"].value ===
              seqID) ||
            s.xml_tag["rdf:about"].value === seqID
          );

          if (partSeq && partSeq.elements) {
            const seqInput = first(partSeq.elements) || "";
            const {
              seq,
              compSeq
            } = dnaComplement(seqInput);
            partList.push({
              ...partFactory(),
              name,
              note,
              seq,
              compSeq,
              annotations
            });
          }
        });

        // check whether any parts were created from the collection
        if (partList.length) {
          resolve(partList);
        }

        // nothing in root
        resolve([]);
      }
    );
  });