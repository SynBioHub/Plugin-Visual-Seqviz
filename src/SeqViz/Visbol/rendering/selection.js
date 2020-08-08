import * as React from "react";
import { SelectionContext } from "../../handlers/selection.jsx";

export default class VisbolSelection extends React.Component {
  static contextType = SelectionContext;
  render() {
    let { annref } = this.context[0];
    let { components } = this.props;

    const selectStyle = {
      stroke: "none",
      fill: "#DEF6FF",
      shapeRendering: "auto"
    };
    let edgeStrokeWidth = 1;
    const edgeStyle = {
      fill: "transparent",
      stroke: "black",
      strokeWidth: edgeStrokeWidth,
      shapeRendering: "auto"
    };

    if (annref) {
      let selection = components.find(com => com.id === annref);
      let height = selection.dimensions[1] * 2;
      let width = selection.dimensions[0] * 1.6;
      let xstart = selection.coords[0] - width * 0.1;
      let ystart = selection.coords[1] - selection.dimensions[1];
      return (
        <g id="la-vz-visbol-selection">
          <rect x={xstart} y={ystart} width={width} height={height} {...selectStyle} />
          <line x1={xstart} y1={ystart} x2={xstart} y2={ystart + height} {...edgeStyle} />
          <line x1={xstart + width} y1={ystart} x2={xstart + width} y2={ystart + height} {...edgeStyle} />
        </g>
      )

    } else {
      return <g id="la-vz-visbol-selection"></g>;
    }
  }
}
