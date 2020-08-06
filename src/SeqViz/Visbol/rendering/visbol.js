import React from 'react';
import Glyph from '../design/glyph';
import Backbone from './backbone';
import GlyphRenderer from './GlyphRenderer';
import HookRenderer from './HookRenderer';
import withViewerHOCs from "../../handlers";
import VisbolSelection from "./selection";


class Visbol extends React.Component {
  constructor() {
    super();
  }
  getRendering(display, backboneY) {
    let index = -1;
    const rendering = display.toPlace.map(item => {
      index += 1;
      if (item instanceof Glyph) {
        return <GlyphRenderer
          key={index}
          defaultString={item.defaultString}
          coords={item.coords}
          name={item.name}
          tooltip={item.tooltip}
          id={item.id}
          uri={item.uri}
          inset={item.inset}
          labelLocation={item.labelLocation}
          backboneY={backboneY}
        />
      }
      else {
        return <HookRenderer
          key={index}
          defaultString={item.defaultString}
          start={item.start}
          tip={item.tip}
          rotation={item.rotation}
          backboneY={backboneY}
          direction={item.direction}
        />
      }
    });
    return rendering;
  };
  render() {
    const display = this.props.display;
    // const [size, setSize] = useState(1);
    const backboneY = (display.height - display.largestInset);
    const rendering = this.getRendering(display, backboneY);
    const safety = 20;
    return (
      <svg className='visbol-viewport' width={display.width * 2 + safety} height={display.height * 2 + display.largestInset + safety}>
        <g transform={`translate(${safety / 2}, ${display.largestInset + safety / 2}) scale(2)`}>
          <VisbolSelection components={display.toPlace} />
          <Backbone stroke={1} length={display.width} x={0} y={backboneY} />
          {rendering}
        </g>
      </svg>
    )
  }
}

export default withViewerHOCs(Visbol);