const express = require("express");
const opn = require("opn");
const Discord = require("discord.js");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const DiscordOAuth = require("discord-oauth2");
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
    database: process.env.DB || "ice"
});
const client = new Discord.Client();
client.login(process.env.TOKEN);

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
    if(number > 1e6) {
        return Math.floor(number / 1e6) + "m";
    } else if(number > 1e3) {
        return Math.floor(number / 1e3) + "k";
    }
    return number;
}

const cache = new Map();

app.get("/", async (req, res) => {
    var time = cache.get("refreshed");
    var shouldUpdate = false;
    if(time) {
        time = time.getTime();
        if(time < Date.now() - 60000) shouldUpdate = true;
    } else shouldUpdate = true;
    if(shouldUpdate) {
        var users = 0;
        for(var [, guild] of client.guilds.cache) {
            users += guild.memberCount;
        }
        cache.set("users", users);
    }
    res.render("index", {
        servers: client.guilds.cache.size,
        users: formatNumber(cache.get("users")),
        user: undefined
    });
});

app.get("/login", async (req, res) => {
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
    if(!token) {
        return res.redirect("/");
    }
    res.cookie("token", token.access_token);
    res.redirect("/dashboard");
});

app.get("/dashboard", async (req, res) => {
    if(!req.cookies.token) return res.redirect("/");
    const user = await oauth.getUser(req.cookies.token);
    if(!user) return res.redirect("/");

    res.render("dashboard", {
        user
    });
});

app.listen(8080, () => {
    console.log("Listening at", "http://localhost:8080/");
    opn("http://localhost:8080/");
});