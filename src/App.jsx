import React from 'react';
import logo from './logo-blue.svg';

import './sass/main.scss';

function App() {
  return (<div className="App">
    <header>
      <nav>
        <img src={logo} alt="Logo" />
        <ul>
          <li><a href="#link" class="btn-text">Home</a></li>
          <span>|</span>
          <li><a href="#link" class="btn-text">Bot</a></li>
          <span>|</span>
          <li><a href="#link" class="btn-text">Contact us</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <section class="about">
        <h1 class="main">Ice productions</h1>
        <p>We are independent team working on tools to help developers all over the world.</p>
        <h2 class="u-margin-top-small">Our creations</h2>
        <ul class="u-blue-bullets">
          <li><a class="btn-text" href="https://github.com/iceproductions/website">This website</a></li>
          <li><a class="btn-text" href="https://github.com/iceproductions/discord-bot">Discord bot</a></li>
          <li><a class="btn-text" href="https://github.com/iceproductions/browser">Browser</a></li>
          <li><a class="btn-text" href="https://github.com/iceproductions">More of our work</a></li>
        </ul>
        <br />>
                <a href="https://discord.gg/JUTFUKH" class="btn btn--blue">Join our discord server</a>
      </section>
      <section></section>
      <section></section>
    </main>

    <footer>
    </footer>
  </div>
  );
}

export default App;