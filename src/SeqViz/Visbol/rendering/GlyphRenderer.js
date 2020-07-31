import React from 'react';
import { ParametricSVG } from 'react-parametric-svg';
import Label from './labelCreator';

function GlyphRenderer(props) {
    var baseline_y = props.backboneY - props.coords[1];
    var baseline_x = props.coords[0];
    if (props.coords[1] !== 0) { //glyph isn't on baseline
        baseline_y -= props.inset;
    }
    return (
        <g
            onMouseEnter={(event) => hoverOtherAnnotationRows(event, props.id, 1.0, true, props.tooltip)}
            onMouseLeave={(event) => hoverOtherAnnotationRows(event, props.id, 0.7, false, '')}
            data-uri={props.uri}>
            <Label name={props.name} x={props.labelLocation.x} y={props.backboneY - props.labelLocation.y} />
            <ParametricSVG svgString={props.defaultString} innerOnly={true} params={{ baseline_x: baseline_x, baseline_y: baseline_y }} />
        </g>
    );

    function hoverOtherAnnotationRows(event, className, opacity, isTooltipShown, text) {
        event.stopPropagation();
        const elements = document.getElementsByClassName(className);
        for (let i = 0; i < elements.length; i += 1) {
            elements[i].style.fillOpacity = opacity;
        }
        if (isTooltipShown) {
            let view = document.getElementsByClassName('la-vz-seqviz')[0].getBoundingClientRect();
            // console.log(event.clientX, event.clientY, event.offsetX, event.offsetY, linear)
            let left = event.clientX - view.left;
            let top = event.clientY - view.top;
            let tooltip = document.getElementById("linear-tooltip");
            tooltip.innerHTML = text;
            tooltip.style.display = "block";
            tooltip.style.left = left + 20 + 'px';
            tooltip.style.top = top + 'px';
        } else {
            let tooltip = document.getElementById("linear-tooltip");
            tooltip.style.display = "none";
        }
    }
}

export default GlyphRenderer;