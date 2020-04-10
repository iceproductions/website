fetch("https://api.iceproductions.dev/v1", {
    method: "POST",
    headers: {
        "Content-type": "application/graphql"
    },
    body: `{
        info {
            version {
            string
            }
        }
        commands {
            name,
            description,
            group
        }
    }`
}).then(res => res.json()).then(json => {
    console.log(json.data);
    const table = document.getElementById("commands");
    json.data.commands.forEach(cmd => {
        table.innerHTML += `
            <tr>
                <td>${cmd.group}</td>
                <td>${cmd.name}</td>
                <td>${cmd.description}</td>
            </tr>
        `;
    });
});