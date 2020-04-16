(async () => {
    const data = new BotConnector;
    const json = await data.commands();
    const table = document.getElementById("commands");
    json.commands.forEach(cmd => {
        table.innerHTML += `
            <tr>
                <td>${cmd.group}</td>
                <td>${cmd.name}</td>
                <td>${cmd.description}</td>
            </tr>
        `;
    });
})();