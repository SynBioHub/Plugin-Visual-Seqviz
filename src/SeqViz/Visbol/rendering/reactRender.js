import React, { useState } from 'react';
import Visbol from './visbol';
import CentralIndexContext from "../../handlers/centralIndex";

export default class Rendering extends React.Component {
  constructor() {
    super();
  }
  render() {
    const { display } = this.props;
    const safety = 20;
    return (
      <CentralIndexContext.Consumer>
        {({ setCentralIndex }) => (
          <div className='visbol-container' style={{ width: `${display.width * 2 + safety}px`, height: `${display.height * 2 + display.largestInset + safety}px`, padding: 5 + 'px' }}>
            <Visbol {...this.props} setCentralIndex={setCentralIndex} />
          </div>
        )}
      </CentralIndexContext.Consumer>
    )
  }
}

