import Display from './display';
import Glyph from './glyph';
import prepareInfo from '../gatherInfo/prepareInfo';

/**
 * This function creates a Display instance, which is used to edit/render all relevant glyphs
 * @param {Object} displayInfo - the information needed to construct the display
 */
function prepareDisplay(displayInfo, forwards = true) {
    const extractedInfo = prepareInfo(displayInfo, forwards);
    const glyphDictionary = {};
    extractedInfo.glyphList.forEach(glyphInfo => {
        if (!(glyphInfo.id in glyphDictionary)) {
            glyphDictionary[glyphInfo.id] = new Glyph(glyphInfo);
        }
    });
    extractedInfo.hookList.forEach(hookInfo => {
        glyphDictionary[hookInfo.startGlyph].hookTo(glyphDictionary[hookInfo.destinationGlyph], hookInfo.direction, hookInfo.type);
    })
    let display = new Display(glyphDictionary, extractedInfo.rootGlyphs, 0);
    display.renderGlyphs();
    return display;
}

export default prepareDisplay;