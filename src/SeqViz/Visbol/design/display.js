import ReactDOM from 'react-dom';
import React from 'react';
import Rendering from '../rendering/reactRender';
/**
 * This class represents the Visbol rendered display. It allows to deletion and adding of glyphs
 */
class Display {
    constructor(glyphDictionary, rootGlyphs) {
        this.glyphDictionary = glyphDictionary;
        this.rootGlyphs = rootGlyphs;
        this.height = 0;
        this.width = 0;
        this.largestInset = 0;
        this.toPlace = [];
    }

    /**
     * Return the glyph dictionary
     */
    getGlyphDictionary() {
        return this.glyphDictionary;
    }

    /**
     * This method configures the glyphs for rendering
     * @param {string} type
     */
    renderGlyphs() {
        this.rootGlyphs.forEach(glyphId => {
            this.glyphDictionary[glyphId].placeSelfAndHooks(this);
        });
    }

    /**
     * This method removes a glyph stored in the display by ID
     * @param {string} id 
     */
    deleteGlyph(id) {
        glyphDictionary[id].hookedTo.glyph.unhook(hookedTo.direction);
        delete this.glyphDictionary[id];
    }

    /**
     * This method adds a glyph to the display if it doesn't already exist in the display
     * @param {string} id 
     * @param {Object} glyph 
     */
    addGlyph(id, glyph) {
        if (!this.glyphDictionary[id]) {
            this.glyphDictionary[id] = glyph;
        }
        //would need to hook glyph to appropriate glyphs
    }
}

export default Display;