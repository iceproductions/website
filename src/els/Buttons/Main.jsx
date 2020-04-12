import React from 'react';

export default function Main({ children, element, ...args}) {
    var Element = element;
    if(!Element) {
        Element = "button";
    }
    return (
        <Element className="btn btn--blue" {...args}>
            {children}
        </Element>
    );
}