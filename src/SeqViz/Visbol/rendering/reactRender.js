import React, { useState } from 'react';
import Glyph from '../design/glyph';
import Navigator from './Navigator';
import Backbone from './backbone';
import GlyphRenderer from './GlyphRenderer';
import HookRenderer from './HookRenderer';

function Rendering(props) {
    const display = props.display;
    // const [size, setSize] = useState(1);
    console.log(display);
    const backboneY = (display.height - display.largestInset);
    const rendering = getRendering(display, backboneY);
    const safety = 10;
    return (
        <div className='visbol-container'>
            {/* <Navigator size={size} setSize={setSize} /> */}
            <div className='rendering'>
                <svg className='visbol-viewport' width={display.width * 2 + safety} height={display.height * 2 + display.largestInset + safety} style={{ padding: 10 + 'px' }}>
                    <g transform={`translate(${safety / 2}, ${display.largestInset + safety / 2})`} style={{ transform: 'scale(2)' }}>
                        <Backbone stroke={1} length={display.width} x={0} y={backboneY} />
                        {rendering}
                    </g>
                </svg>
            </div>
        </div>
    )
}

function getRendering(display, backboneY) {
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
}

export default Rendering;