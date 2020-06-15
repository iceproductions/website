"use strict";

var app = (function App() {
  const data = new BotConnector();

  return { init };

  function init() {
    initNavigationMenu();
    // renderCommandTable();
  }

  function initNavigationMenu() {
    var navMenuList = document.getElementById("nav-menu");
    var hamburgerButton = document.getElementById("hamburger-icon");
    hamburgerButton.addEventListener("click", () => {
      navMenuList.classList.toggle("displayed");
      hamburgerButton.classList.toggle("clicked");
      navMenuList.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    });
  }

  async function renderCommandTable() {
    const json = await data.commands();
    const table = document.getElementById("commands");
    json.commands.forEach((cmd) => {
      table.innerHTML += `
              <tr>
                  <td>${cmd.group}</td>
                  <td>${cmd.name}</td>
                  <td>${cmd.description}</td>
              </tr>
          `;
    });
  }
})();

app.init();
