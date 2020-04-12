import React from 'react';

export default function MainTitle(props) {
    return (
        <h2 className="u-margin-top-small">
            {props.children}
        </h2>
    );
}