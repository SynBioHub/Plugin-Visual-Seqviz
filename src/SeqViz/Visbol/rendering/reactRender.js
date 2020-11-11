import React, { useState } from 'react';
import Visbol from './visbol';
import CentralIndexContext from "../../handlers/centralIndex";

export default class Rendering extends React.Component {
  constructor() {
    super();
  }
  render() {
    const { display } = this.props;
    const safetx = 150;
    const safety = 40;
    return (
      <CentralIndexContext.Consumer>
        {({ setCentralIndex }) => (
          <div className='visbol-container' style={{ width: `${display.width * 2 + safetx}px`, height: `${display.height * 2 + display.largestInset + safety}px`, padding: 10 + 'px' }}>
            <Visbol {...this.props} setCentralIndex={setCentralIndex} />
          </div>
        )}
      </CentralIndexContext.Consumer>
    )
  }
}

