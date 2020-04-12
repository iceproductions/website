import React from 'react';

import logo from '../img/logo-blue.svg';

export default function Header() {
    return (
        <header>
            <nav>
                <img src={logo} alt="Logo" />
                <ul>
                    <li><a href="#link" className="btn-text">Home</a></li>
                    <span>|</span>
                    <li><a href="#link" className="btn-text">Bot</a></li>
                    <span>|</span>
                    <li><a href="#link" className="btn-text">Contact us</a></li>
                </ul>
            </nav>
        </header>
    );
}