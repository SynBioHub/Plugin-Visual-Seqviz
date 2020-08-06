import React, { useState } from 'react';
import Visbol from './visbol';

export default class Rendering extends React.Component {
  constructor() {
    super();
  }
  render() {
    const { display, selection } = this.props;
    const safety = 20;
    return (
      <div className='visbol-container' style={{ width: `${display.width * 2 + safety}px`, height: `${display.height * 2 + display.largestInset + safety}px`, padding: 5 + 'px' }}>
        <Visbol display={display} selection={selection} />
      </div>
    )
  }
}

