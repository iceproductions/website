const express = require("express");
const opn = require("opn");
const Discord = require("discord.js");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const DiscordOAuth = require("discord-oauth2");
const got = require("got");
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const oauth = new DiscordOAuth({
    clientId: process.env.CID,
    clientSecret: process.env.CSECRET,
    redirectUri: process.env.HOST + "/callback"
});
const pool = mysql.createPool({
    host: process.env.DBHOST || "127.0.0.1",
    user: process.env.DBUSER || "root",
    password: process.env.DBPASS || "",
    database: process.env.DB || "ice",
    supportBigNumbers: true,
    bigNumberStrings: true
});
const client = new Discord.Client({
    messageCacheMaxSize: 5,
    messageCacheLifetime: 2,
    messageSweepInterval: 2
});
client.login(process.env.TOKEN);


const permissionsList = {
    CREATE_INSTANT_INVITE: 1,
    KICK_MEMBERS: 2,
    BAN_MEMBERS: 4,
    ADMINISTRATOR: 8,
    MANAGE_CHANNELS: 16,
    MANAGE_GUILD: 32,
    ADD_REACTIONS: 64,
    VIEW_AUDIT_LOG: 128,
    PRIORITY_SPEAKER: 256,
    VIEW_CHANNEL: 1024,
    READ_MESSAGES: 1024,
    SEND_MESSAGES: 2048,
    SEND_TTS_MESSAGES: 4096,
    MANAGE_MESSAGES: 8192,
    EMBED_LINKS: 16384,
    ATTACH_FILES: 32768,
    READ_MESSAGE_HISTORY: 65536,
    MENTION_EVERYONE: 131072,
    EXTERNAL_EMOJIS: 262144,
    USE_EXTERNAL_EMOJIS: 262144,
    CONNECT: 1048576,
    SPEAK: 2097152,
    MUTE_MEMBERS: 4194304,
    DEAFEN_MEMBERS: 8388608,
    MOVE_MEMBERS: 16777216,
    USE_VAD: 33554432,
    CHANGE_NICKNAME: 67108864,
    MANAGE_NICKNAMES: 134217728,
    MANAGE_ROLES: 268435456,
    MANAGE_ROLES_OR_PERMISSIONS: 268435456,
    MANAGE_WEBHOOKS: 536870912,
    MANAGE_EMOJIS: 1073741824
};
const convertPerms = function (permNumber) {
    if (isNaN(Number(permNumber))) throw new TypeError(`Expected permissions number, and received ${typeof permNumber} instead.`);
    permNumber = Number(permNumber);
    let evaluatedPerms = {};
    for (let perm in permissionsList) {
        let hasPerm = Boolean(permNumber & permissionsList[perm]);
        evaluatedPerms[perm] = hasPerm;
    }
    return evaluatedPerms;
};

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(cookieParser());

client.on("ready", () => {
    console.log("discord client ready");
});

/**
 * Formats number to shorten it, like 151000 -> 151k
 * @param {number} number to format
 * @returns {string}
 */
function formatNumber(number) {
    if (number > 1e6) {
        return Math.floor(number / 1e6) + "m";
    } else if (number > 1e3) {
        return Math.floor(number / 1e3) + "k";
    }
    return number;
}

const cache = new Map();

app.get("/", async (req, res) => {
    var time = cache.get("refreshed");
    var shouldUpdate = false;
    if (time) {
        time = time.getTime();
        if (time < Date.now() - 60000) shouldUpdate = true;
    } else shouldUpdate = true;
    if (shouldUpdate) {
        var users = 0;
        for (var [, guild] of client.guilds.cache) {
            users += guild.memberCount;
        }
        cache.set("users", users);
    }
    res.render("index", {
        servers: client.guilds.cache.size,
        users: formatNumber(cache.get("users")),
        user: await oauth.getUser(req.cookies.token)
    });
});

app.get("/login", async (req, res) => {
    if(req.cookies.token) {
        if(await oauth.getUser(req.cookies.token)) {
            return res.redirect("/dashboard");
        }
    }
    res.redirect(oauth.generateAuthUrl({
        scope: ["identify", "guilds", "email"],
        state: crypto.randomBytes(16).toString("hex")
    }));
});

app.get("/callback", async (req, res) => {
    const token = await oauth.tokenRequest({
        code: req.query.code,
        scope: ["identify", "guilds", "email"],
        grantType: "authorization_code"
    });
    if (!token) {
        return res.redirect("/");
    }
    res.cookie("token", token.access_token);
    res.redirect("/dashboard");
});

async function fetchUserData(req, opts = {}) {
    if (!req.cookies.token) {
        return res.redirect("/login");
    }
    const user = await oauth.getUser(req.cookies.token);
    if(!opts.ignoreGuilds)
        var guilds = await got("https://discord.com/api/users/@me/guilds", {
            headers: {
                Authorization: "Bearer " + req.cookies.token
            },
            responseType: "json",
            resolveBodyOnly: true
        }).json();
    if (!user || (!guilds && !opts.ignoreGuilds)) {
        console.log(!user ? "User missing" : (!guilds ? "Guilds missing" : ""));
        throw new Error("User not logged in");
    }

    if(!opts.ignoreGuilds)
        for(var guild of guilds) {
            guild.permissions = convertPerms(guild.permissions);
        }
    var returned = { user };
    if(!opts.ignoreGuilds) returned = {
        user,
        guilds,
        availableGuilds: guilds.filter(g => {
            if(!g.permissions.ADMINISTRATOR) return false;
            return !!client.guilds.resolve(g.id);
        }) 
    }
    return returned;
}

app.get("/dashboard", async (req, res) => {
    try {
       var user = await fetchUserData(req);
    } catch(e) {
        return res.redirect("/login");
    }
    return res.render("dashboard", user);
});

app.get("/dashboard/:guild", async (req, res) => {
    try {
        var {user, availableGuilds} = await fetchUserData(req);
    } catch(e) {
        return res.redirect("/login");
    }

    var guild = availableGuilds.filter(g => g.id === req.params.guild)[0];

    if(!guild) return res.redirect("/dashboard");

    return res.render("dashboard/guild", {
        user,
        availableGuilds,
        guild
    });
});

async function fetchPublicGuild(id) {
    var [guildVotes] = await pool.query("SELECT COUNT(v.id) AS votes FROM guilds as g LEFT JOIN votes AS v ON v.guild = g.snowflake WHERE g.public = true AND g.snowflake = ?", [id]);
    guildVotes = guildVotes[0];
    if(!guildVotes) throw new Error("Guild not found or not public");

    var guild = client.guilds.resolve(id);
    guild.votes = guildVotes.votes;
    return guild;
}

async function fetchPublicGuilds(offset, max) {
    var [guilds] = await pool.query("SELECT g.snowflake as id, COUNT(v.id) AS votes FROM guilds as g LEFT JOIN votes AS v ON v.guild = g.snowflake WHERE g.public = true LIMIT ?,?", [offset, max]);
    console.log(guilds.length, offset, max);
    for(var guild in guilds) {
        guilds[guild] = {
            ...guilds[guild],
            ...client.guilds.resolve(guilds[guild].id)
        };
    }

    guilds = guilds.filter(g => !!g.name);

    return guilds;
}

function fetchGuildAs(guild, token) {
    return got("https://discord.com/api/users/@me/guilds/" + guild, {
        headers: {
            Authorization: "Bearer " + token
        },
        responseType: "json",
        resolveBodyOnly: true
    }).json();
}

async function userVoted(id, guild) {
    return await !!await pool.query("SELECT id FROM votes WHERE user = ? AND guild = ? AND date > NOW() - INTERVAL 12 HOUR", [id, guild])[0];
}

app.get("/list", async (req, res) => {
    try {
        var { user } = await fetchUserData(req, { ignoreGuilds: true });
    } catch(e) {
        return res.redirect("/login");
    }

    var guilds =  await fetchPublicGuilds(0, 10);
    console.log(guilds);

    return res.render("list", {
        user,
        guilds
    });
});

app.get("/list/:guild", async (req, res) => {
    try {
        var { user, guilds } = await fetchUserData(req);
    } catch(e) {
        return res.redirect("/login");
    }

    const guild = await fetchPublicGuild(req.params.guild);

    const userGuild = guilds.filter(g => g.id === guild.id);

    const voted = userVoted(user.id, guild.id);
        
    return res.render("list/guild", {
        user,
        guild,
        voted,
        userGuild
    });
});

app.listen(8080, () => {
    console.log("Listening at", "http://localhost:8080/");
    if(!process.argv.includes("--noop")) opn("http://localhost:8080/");
});