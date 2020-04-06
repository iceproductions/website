import React from 'react';

export default function MainTitle(props) {
    return (
        <h1 class="main">
            {props.children}
        </h1>
    );
}