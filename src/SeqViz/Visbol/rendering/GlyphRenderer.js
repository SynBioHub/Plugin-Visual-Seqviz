import React from 'react';
import { ParametricSVG } from 'react-parametric-svg';
import Label from './labelCreator';

function GlyphRenderer(props) {
    const { backboneY, inputRef, item } = props;
    var baseline_y = backboneY - item.coords[1];
    var baseline_x = item.coords[0];
    if (item.coords[1] !== 0) { //glyph isn't on baseline
        baseline_y -= item.inset;
    }
    return (
        <g
            onMouseEnter={(event) => hoverOtherAnnotationRows(event, item.id, 1.0, true, item.tooltip)}
            onMouseLeave={(event) => hoverOtherAnnotationRows(event, item.id, 0.7, false, '')}
            uri={item.uri}
            id={item.id}
            ref={inputRef(item.id, {
                ref: item.id,
                annref: item.id,
                type: "ANNOTATION",
                ranges: item.ranges
            })}
        >
            <Label name={item.name} x={item.labelLocation.x} y={backboneY - item.labelLocation.y} />
            <ParametricSVG svgString={item.defaultString} innerOnly={true} params={{ baseline_x: baseline_x, baseline_y: baseline_y }} />
        </g>
    );

    function hoverOtherAnnotationRows(event, className, opacity, isTooltipShown, text) {
        event.stopPropagation();
        const elements = document.getElementsByClassName(className);
        if (isTooltipShown) {
            let view = document.getElementsByClassName('la-vz-seqviz')[0].getBoundingClientRect();

            let left = event.clientX - view.left;
            let top = event.clientY - view.top;
            let tooltip = document.getElementById("linear-tooltip");
            tooltip.innerHTML = text;
            tooltip.style.display = "block";
            tooltip.style.left = left + 20 + 'px';
            tooltip.style.top = top + 10 + 'px';
            for (let i = 0; i < elements.length; i += 1) {
                elements[i].style.fillOpacity = opacity;
                elements[i].classList.add("hoveredannotation");
            }
        } else {
            let tooltip = document.getElementById("linear-tooltip");
            tooltip.style.display = "none";
            for (let i = 0; i < elements.length; i += 1) {
                elements[i].style.fillOpacity = opacity;
                elements[i].classList.remove("hoveredannotation");
            }
        }
    }
}

export default GlyphRenderer;