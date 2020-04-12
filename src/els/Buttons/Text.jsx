import React from 'react';

export default function Text({ children, element, ...args}) {
    var Element = element;
    if(!Element) {
        Element = "button";
    }
    return (
        <Element className="btn-text" {...args}>
            {children}
        </Element>
    );
}