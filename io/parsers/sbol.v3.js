import {
  partFactory,
  dnaComplement
} from "../utils/parser";
import {
  annotationFactory
} from "../utils/sequence";
import {
  chooseRandomColor
} from "../utils/colors";
import randomid from "../utils/randomid";
import sboToInteractionType from '../sboToInteractionType';
import sboToRole from '../sboToRole';
import soToGlyphType from '../soToGlyphType';
import soToTopology from '../soToTopology';
import nonDNATypes from '../nonDNATypes';

const sbolmeta = require('sbolmeta');
const SBOLDocument = require('sboljs');

const URI = require('sboljs').URI;
const sha1 = require('sha1');

/**
 * SBOL v2.0 schema definition can be found at: http://sbolstandard.org/wp-content/uploads/2016/06/SBOL-data-model-2.2.1.pdf
 * differs from SBOL 1 in that the ComponentDefinitions are like the root parts,
 * and the sequence and annotations are separated (they're no longer defined relationally
 * by nesting but, instead, by id)
 *
 * we only care about components that have sequence information
 */

/**
 * takes an SBOL file, as a string, and converts it into our DB
 * representation of a part(s). an example of this type of file can be
 * found in ../examples/j5.SBOL.xml
 */
export default async (source, fileName, topLevel, colors = []) =>
  new Promise((resolve, reject) => {
    // weird edge case with directed quotation characters
    const rejectSBOL = () => {
      return reject('rejected');
    };
    SBOLDocument.loadRDF(source, function (err, sbol) {
      if (err) {
        rejectSBOL(err);
      } else {
        // it's a collection of DnaComponents, parse each to a part
        var partLists = [];
        var segments = [];
        sbol.componentDefinitions.forEach(function (componentDefinition) {
          if (componentDefinition && !(componentDefinition instanceof URI) && componentDefinition.uri && componentDefinition.uri.toString() === topLevel) {
            var {
              partList,
              segment
            } = getDisplayListSegment(componentDefinition);
            // segment = recurseGetDisplayList(componentDefinition, segment);
            partLists = partLists.concat(partList);
            segments = segments.concat(segment);
          }
        });

        var interactions = [];
        //processing module definition
        sbol.moduleDefinitions.forEach(function (moduleDefinition) {
          let currentInteractions = getInteractionList(moduleDefinition);
          for (let i in currentInteractions) {
            interactions.push(currentInteractions[i]);
          }
        });

        const displayList = {
          version: 1,
          name: sbol.componentDefinitions[0].name || sbol.componentDefinitions[0].displayId,
          components: [{
            segments
          }],
          interactions,
        }

        // var partLists = partLists.filter(part => part.segmentId === sbol.componentDefinitions[0].uri.toString());

        if (partLists.length === 0) {
          rejectSBOL(err);
        }

        resolve({
          displayList,
          partLists
        });
      }
    })
  });

function getTypes(types) {
  var topologies = [];
  //default is alway the part to be rendered is a DNA one
  var nonDNAType = null;

  types.forEach((type) => {
    /*
     * need to check to see if glyph is a DNA or nonDNA part
     */
    if (type._parts.fragment) {
      if (type._parts.fragment !== 'DnaRegion') {
        if (nonDNATypes[type._parts.fragment]) {
          nonDNAType = nonDNATypes[type._parts.fragment]
        }
      }
    }

    var so = (type + '').match(/SO.([0-9]+)/g)

    if (!so || !so.length)
      return;

    var soCode = so[0].split('_').join(':')
    var topology = soToTopology(soCode)

    if (topology)
      topologies.push(topology)
  })
  return {
    nonDNAType,
    topologies
  }
}

function trimSequence(segment, max) {
  if (max === undefined) {
    return segment
  }

  if (segment.sequence.length < max) {
    return segment
  }

  segment.sequence = segment.sequence.slice(0, max)
  return segment
}

function recurseGetDisplayList(componentDefinition, segments, config, share, max) {
  sortedSubComponents(componentDefinition).forEach((component) => {

    if (component.definition && !(component.definition instanceof URI) &&
      component.definition.uri) {
      if (component.definition.components.length === 0) return segments
      let {
        partList,
        segment
      } = getDisplayListSegment(component.definition, config, share);

      if (segment[0].sequence.length > 0) {
        if (segments.filter(function (e) {
            return e.name == segment[0].name;
          }).length == 0) {
          segments.push(segment[0]);
        }
      }

      segments = recurseGetDisplayList(component.definition, segments, config, share)
    }
  })

  return segments.map(segment => trimSequence(segment, max))
}

function sortedSubComponents(componentDefinition) {

  return sortedSequenceAnnotations(componentDefinition).map((sequenceAnnotation) => {
    return sequenceAnnotation.component
  })

}

function getInteractionList(moduleDefinition, config, share) {

  let interactions = [];

  moduleDefinition.interactions.forEach(function (interaction) {

    let interactionObj = {};
    interactionObj.displayId = interaction.displayId;

    //This is for when there are more than just one of this type of interaction 
    interactionObj.name = interaction.name;

    //Finding type of interaction
    if (interaction.types.length === 1) {

      var SBOCode = interaction.types[0]._parts.path.split('/').pop();
      interactionObj.type = sboToInteractionType(SBOCode);
      interactionObj.SBO = SBOCode;
    }

    interactionObj.participants = [];

    //Making participation objects
    interaction.participations.forEach(function (participation) {


      let participantObj = {};
      if (participation.displayId !== undefined) {
        participantObj.displayId = participation.displayId;
      }

      if (participation.participant.definition && !(participation.participant.definition instanceof URI) && participation.participant.definition.uri) {
        let {
          partList,
          segment
        } = getDisplayListSegment(participation.participant.definition, config, share);
        participantObj.segment = segment;
        participantObj.name = participation.participant.definition.displayId;

        //Attaching type when participant is Non-DNA
        if (participation.participant.definition.types[0]._parts.fragment != "DnaRegion") {

          if (participation.participant.definition.types.length === 1) {
            //Attaching type
            participantObj.type = participation.participant.definition.types[0]._parts.fragment;
          }
        }

        //Attaching type when participant is DNA 
        else if (participation.participant.definition.roles.length === 1) {


          var SOCode = participation.participant.definition.roles[0]._parts.path.split('/').pop();
          //var SOCode = participation._roles[0]._parts.path.split('/').pop();
          // This property only exists for DNA parts 
          participantObj.SO = SOCode;
          participantObj.type = soToGlyphType(SOCode);
        }
      }

      if (participation.roles.length === 1) {

        var SBOCode = participation.roles[0]._parts.path.split('/').pop();

        //This is the SBO term which determines role of the part in the interaction 
        participantObj.role = sboToRole(SBOCode);
        participantObj.SBO = SBOCode;
      }
      //Adding current participant object to current interaction participants list 
      interactionObj.participants.push(participantObj);
    })
    //Adding current interaction object to interactions list
    interactions.push(interactionObj);
  })

  return interactions;
}


function getDisplayListSegment(componentDefinition, config, share, i) {
  const name = componentDefinition.name || componentDefinition.displayId;
  const note = componentDefinition.description;
  const {
    nonDNAType,
    topologies
  } = getTypes(componentDefinition.types);

  var annotations = [];
  var sequence = [];
  var partList = [];
  var segmentId = componentDefinition.uri.toString();

  if (componentDefinition.sequenceAnnotations.length === 0 && componentDefinition.components.length === 0) {
    var glyph = 'unspecified';
    var roles = componentDefinition.roles;
    var uri = componentDefinition.uri.toString();

    if (config && uri.startsWith(config.get('databasePrefix'))) {
      if (uri.startsWith(config.get('databasePrefix') + 'user/') && share) {
        uri = '/' + uri.replace(config.get('databasePrefix'), '') + '/' + sha1('synbiohub_' + sha1(uri) + config.get('shareLinkSalt')) + '/share';
      } else {
        uri = '/' + uri.replace(config.get('databasePrefix'), '');
      }
    }

    var tooltip = '<b style="text-align:center;display:block">Component</b>';
    if (componentDefinition.displayId) tooltip += '<b>Identifier:</b> ' + componentDefinition.displayId + '<br/>'
    if (componentDefinition.name) tooltip += '<b>Name:</b> ' + componentDefinition.name + '<br/>'
    if (componentDefinition.description) tooltip += '<b>Description:</b> ' + componentDefinition.description + '<br/>'

    /*
     *if glyph is nonDnA we need to set the glyph
     */
    if (nonDNAType) {
      glyph = nonDNAType
    }

    roles.forEach((role) => {
      let igemPartPrefix = 'http://wiki.synbiohub.org/wiki/Terms/igem#partType/';
      let igemFeaturePrefix = 'http://wiki.synbiohub.org/wiki/Terms/igem#feature/';
      let soPrefix = 'http://identifiers.org/so/';
      if (role.toString().indexOf(igemPartPrefix) === 0) {
        tooltip += '<b>iGEM Part Type:</b> ' + role.toString().slice(igemPartPrefix.length) + '<br/>';
      } else if (role.toString().indexOf(igemFeaturePrefix) === 0) {
        tooltip += '<b>iGEM Feature Type:</b> ' + role.toString().slice(igemFeaturePrefix.length) + '<br/>';
      } else if (role.toString().indexOf(soPrefix) === 0) {
        let soTerm = role.toString().slice(soPrefix.length).split('_').join(':');
        let rolename = soTerm;
        if (sbolmeta.sequenceOntology[soTerm]) {
          rolename = sbolmeta.sequenceOntology[soTerm].name;
        }
        tooltip += '<b>Role:</b> ' + rolename + '<br/>';
      }
      let so = (role + '').match(/SO.([0-9]+)/g);
      if (!so || !so.length) {
        return;
      }
      let soCode = so[0].split('_').join(':');
      let glyphType = soToGlyphType(soCode);
      if (!nonDNAType) {
        if (glyphType) {
          glyph = glyphType;
        } else {
          glyph = 'no-glyph-assigned';
        }
      }
    })

    sequence = [{
      strand: "positive",
      type: glyph,
      id: randomid(),
      name: name,
      uri: uri,
      tooltip: tooltip,
      isComposite: false
    }];
  } else {
    sortedSequenceAnnotations(componentDefinition).forEach(sequenceAnnotation => {
      var annName = sequenceAnnotation.name || sequenceAnnotation.displayId;
      var annId = randomid();
      var color = chooseRandomColor();
      var glyph = 'unspecified';
      var roles = sequenceAnnotation.roles;
      var uri = '';
      var tooltip = '';
      var visboltooltip = '';
      // If the sequence annotation denotes a component
      if (sequenceAnnotation.component && sequenceAnnotation.component != '') {
        tooltip = '<b style="text-align:center;display:block">Component</b>';
        let component = sequenceAnnotation.component;
        if (component.definition && !(component.definition instanceof URI) && component.definition.uri) {
          annName = component.definition.name || component.definition.displayId;
          roles = roles.concat(component.definition.roles);

          uri = component.definition.uri.toString();
          if (config && uri.startsWith(config.get('databasePrefix'))) {
            if (uri.startsWith(config.get('databasePrefix') + 'user/') && share) {
              uri = '/' + uri.replace(config.get('databasePrefix'), '') + '/' + sha1('synbiohub_' + sha1(uri) + config.get('shareLinkSalt')) + '/share';
            } else {
              uri = '/' + uri.replace(config.get('databasePrefix'), '');
            }
          }

          if (component.definition.displayId) {
            tooltip += '<b>Identifier:</b> ' + component.definition.displayId + '<br/>';
          }
          if (component.definition.name) {
            tooltip += '<b>Name:</b> ' + component.definition.name + '<br/>';
          }
          if (component.definition.description) {
            tooltip += '<b>Description:</b> ' + component.definition.description + '<br/>';
          }
        } else {
          if (component.definition)
            uri = component.definition.toString();
          if (config && uri.startsWith(config.get('databasePrefix'))) {
            if (uri.startsWith(config.get('databasePrefix') + 'user/') && share) {
              uri = '/' + uri.replace(config.get('databasePrefix'), '') + '/' + sha1('synbiohub_' + sha1(uri) + config.get('shareLinkSalt')) + '/share';
            } else {
              uri = '/' + uri.replace(config.get('databasePrefix'), '');
            }
          }
        }
      }
      // else the sequence annotation denotes a feature
      else {
        tooltip = '<b style="text-align:center;display:block">Feature</b>';
        if (sequenceAnnotation.displayId) tooltip += '<b>Identifier:</b> ' + sequenceAnnotation.displayId + '<br/>';
        if (sequenceAnnotation.name) tooltip += '<b>Name:</b> ' + sequenceAnnotation.name + '<br/>';
        if (sequenceAnnotation.description) tooltip += '<b>Description:</b> ' + sequenceAnnotation.description + '<br/>';
      }

      if (roles.length === 0) {
        glyph = 'unspecified'
      } else {
        roles.forEach((role) => {
          let igemPartPrefix = 'http://wiki.synbiohub.org/wiki/Terms/igem#partType/';
          let igemFeaturePrefix = 'http://wiki.synbiohub.org/wiki/Terms/igem#feature/';
          let soPrefix = 'http://identifiers.org/so/';
          if (role.toString().indexOf(igemPartPrefix) === 0) {
            tooltip += '<b>iGEM Part Type:</b> ' + role.toString().slice(igemPartPrefix.length) + '<br/>';
          } else if (role.toString().indexOf(igemFeaturePrefix) === 0) {
            tooltip += '<b>iGEM Feature Type:</b> ' + role.toString().slice(igemFeaturePrefix.length) + '<br/>';
          } else if (role.toString().indexOf(soPrefix) === 0) {
            let soTerm = role.toString().slice(soPrefix.length).split('_').join(':');
            let rolename = soTerm;
            if (sbolmeta.sequenceOntology[soTerm]) {
              rolename = sbolmeta.sequenceOntology[soTerm].name;
            }
            tooltip += '<b>Role:</b> ' + rolename + '<br/>';
          }

          let so = (role + '').match(/SO.([0-9]+)/g);

          if (!so || !so.length)
            return;

          let soCode = so[0].split('_').join(':');
          let glyphType = soToGlyphType(soCode);
          glyph = glyphType ? glyphType : 'no-glyph-assigned';
        })
      }

      let annotationRanges = sequenceAnnotation.ranges;

      annotationRanges.sort((a, b) => {
        if (a.start === b.start) {
          return a.end - b.end;
        }
        return a.start - b.start;
      })

      if (annotationRanges.length > 0) {
        let rangestart = Infinity,
          rangeend = -1;
        annotationRanges.forEach((range) => {
          if (range.start < rangestart) {
            rangestart = range.start;
          }
          if (range.end > rangeend) {
            rangeend = range.end;
          }
        })
        tooltip += '<b>Range:</b> ' + rangestart + '..' + rangeend + '<br/>';
      }

      visboltooltip = tooltip;
      var strand = 'positive';
      annotationRanges.forEach((range, i) => {
        let loc = '';
        annotationRanges.forEach((range, j) => {
          if (i === j) {
            let boldloc = '';
            if (range.orientation) {
              boldloc = '> Orientation: ' + range.orientation.toString().replace('http://sbols.org/v2#', '') + ' ';
            }
            boldloc += range.start + '..' + range.end + '<br/>';
            loc += boldloc.bold();
          } else {
            if (range.orientation) {
              loc += 'Orientation: ' + range.orientation.toString().replace('http://sbols.org/v2#', '') + ' ';
            }
            loc += range.start + '..' + range.end + '<br/>';
          }
        })
        annotations.push({
          ...annotationFactory(annName),
          annId: annId,
          name: annName,
          color: color,
          start: range.start - 1,
          end: range.end,
          tooltip: tooltip + loc,
          uri: uri
        });
      })

      annotationRanges.forEach((range) => {
        if (range.orientation) {
          visboltooltip += 'Orientation: ' + range.orientation.toString().replace('http://sbols.org/v2#', '') + ' ';
          if (range.orientation.toString() === 'http://sbols.org/v2#reverseComplement') {
            strand = 'negative';
          }
        }
        visboltooltip += range.start + '..' + range.end + '<br/>';
      })

      var isComposite = false;
      if (sequenceAnnotation.component.definition &&
        sequenceAnnotation.component.definition.components &&
        sequenceAnnotation.component.definition.components.length > 0) {
        isComposite = true;
      }

      sequence.push({
        strand: strand,
        type: glyph,
        ranges: sequenceAnnotation.ranges.map(
          range => {
            return {
              'displayId': range.displayId,
              'name': range.name,
              'start': range.start,
              'end': range.end,
            }
          }),
        id: annId,
        name: annName,
        uri: uri,
        tooltip: visboltooltip,
        //extra field for detecting composites
        isComposite: isComposite
      })
    })

    annotations.sort((a, b) => {
      if (a.start === b.start) {
        return b.end - a.end;
      }
      return a.start - b.start;
    })
  }

  let segment = [{
    name,
    segmentId,
    sequence,
    topologies
  }];

  // try and find sequence data
  var partSeq = componentDefinition.sequences;

  if (partSeq && partSeq.length > 0) {
    partSeq = partSeq[0];
    if (partSeq.elements) {
      var {
        seq,
        compSeq
      } = dnaComplement(partSeq.elements);
      partList.push({
        ...partFactory(),
        name,
        note,
        seq,
        compSeq,
        segmentId,
        annotations,
      });
    }
  }

  return {
    partList,
    segment,
  }
}


function sortedSequenceAnnotations(componentDefinition) {

  componentDefinition.components.forEach((component) => {
    var foundIt = false;
    componentDefinition.sequenceAnnotations.forEach((sequenceAnnotation) => {
      if (sequenceAnnotation.component === component) foundIt = true;
    })
    if (!foundIt) {
      const sa = {
        displayId: '',
        name: '',
        description: '',
        ranges: [],
        cuts: [],
        roles: [],
        genericLocations: [],
        component: component
      }
      componentDefinition.addSequenceAnnotation(sa);
    }
  })

  return componentDefinition.sequenceAnnotations
    .sort((a, b) => {
      if (a.ranges.length > 0 && b.ranges.length > 0) {
        if (start(a) === start(b)) {
          return end(a) - end(b)
        } else {
          return start(a) - start(b)
        }
      } else if (a.component && b.component) {
        return position(componentDefinition, a.component, {}) - position(componentDefinition, b.component, {})
      }
      return start(a) - start(b)

    })

  function start(sequenceAnnotation) {
    let minStart = sequenceAnnotation.ranges.length > 0 ? sequenceAnnotation.ranges[0].start : 0
    for (let i = 0; i < sequenceAnnotation.ranges.length; i++) {
      if (sequenceAnnotation.ranges[i].start < minStart)
        minStart = sequenceAnnotation.ranges[i].start
    }
    return minStart
  }

  function end(sequenceAnnotation) {
    let maxEnd = sequenceAnnotation.ranges.length > 0 ? sequenceAnnotation.ranges[0].end : 0
    for (let i = 0; i < sequenceAnnotation.ranges.length; i++) {
      if (sequenceAnnotation.ranges[i].end < maxEnd)
        maxEnd = sequenceAnnotation.ranges[i].end
    }
    return maxEnd
  }

  // TODO: note that cycle of sequenceConstraints creates infinite loop
  function position(componentDefinition, component, visited) {
    var curPos = 0
    if (visited[component.uri]) return curPos
    componentDefinition.sequenceConstraints.forEach((sequenceConstraint) => {
      sequenceConstraint.link()
      if (sequenceConstraint.restriction.toString() === 'http://sbols.org/v2#precedes') {
        if (sequenceConstraint.object.uri.toString() === component.uri.toString()) {
          visited[component.uri] = true
          var subPos = position(componentDefinition, sequenceConstraint.subject, visited)
          if (subPos + 1 > curPos)
            curPos = subPos + 1
        }
      }
    })
    return curPos
  }
}