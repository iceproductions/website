import React from 'react';

export default function BulletList(props) {
    if(props.container) {
        return (
            <ul class="u-blue-bullets">
                {props.children}
            </ul>
        );
    } else if(props.item) {
        return (
            <li>
                {props.children}
            </li>
        )
    } else {
        throw new Error("Unknown or unset list type");
    }
}