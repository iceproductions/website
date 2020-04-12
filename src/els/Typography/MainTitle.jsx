import React from 'react';

export default function MainTitle(props) {
    return (
        <h1 className="main">
            {props.children}
        </h1>
    );
}