import React from 'react';
import { SeqViz } from 'seqviz';

export default class Sequence extends React.Component {
  render(){
  return (
    <div style={{ width: '1000px', height: '600px' }}>
    <SeqViz
    name="J23100"
    seq="TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC"
    annotations={[{ name: "promoter", start: 0, end: 34, direction: 1 }]}
  />
  </div>
  );
  }
}
