import React from 'react';

import config from './config';
const textLength = config.text_length;
const textSize = config.text_size;
const font = config.font;

function truncateName(name, length) {
    if (name.length <= length) {
        return name;
    }
    var truncated = '';
    for (let i = 0; i < length - 3; i += 1) {
        truncated += name.charAt(i);
    }
    for (let i = 0; i < 3; i += 1) {
        truncated += '.';
    }
    return truncated;
}

function Label(props) {
    return (
        <text
            fontFamily={font}
            fontSize={`${textSize}px`}
            x={props.x + 1}
            y={props.y - 1.5}>
            {truncateName(props.name, textLength)}
        </text>
    )
}

export default Label;