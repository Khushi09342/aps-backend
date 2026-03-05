const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 10000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:10000/api/callback";

console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", CLIENT_SECRET ? "Loaded" : "Missing");
const TOKEN_FILE = "./token.json";

function saveToken(data) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2));
}

function loadToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_FILE));
}

async function getAccessToken() {

  const tokenData = loadToken();

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const res = await fetch("https://developer.api.autodesk.com/authentication/v2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `grant_type=refresh_token&refresh_token=${tokenData.refresh_token}`
  });

  const newToken = await res.json();

if (!newToken.refresh_token) {
  newToken.refresh_token = tokenData.refresh_token;
}

saveToken(newToken);

  if (!res.ok) {
    throw new Error(JSON.stringify(newToken));
  }

  saveToken(newToken);

  return newToken.access_token;
}

app.get("/api/login", (req, res) => {

  const url =
    "https://developer.api.autodesk.com/authentication/v2/authorize" +
    "?response_type=code" +
    "&client_id=" + CLIENT_ID +
    "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
    "&scope=data:read";

  res.redirect(url);

});

app.get("/api/callback", async (req, res) => {

  const code = req.query.code;

  const response = await fetch("https://developer.api.autodesk.com/authentication/v2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body:
      `grant_type=authorization_code` +
      `&code=${code}` +
      `&client_id=${CLIENT_ID}` +
      `&client_secret=${CLIENT_SECRET}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
  });

  const token = await response.json();

  saveToken(token);

  res.send("Token saved successfully. You can close this page.");
});

app.get("/api/reviews", async (req, res) => {

  const projectId = req.query.projectId;

  if (!projectId) {
    return res.status(400).send("projectId required");
  }

  try {

    const token = await getAccessToken();

    const apiRes = await fetch(
      `https://developer.api.autodesk.com/construction/reviews/v1/projects/${projectId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await apiRes.json();

    res.json(data);

  } catch (err) {

    res.status(500).send(err.message);

  }

});

app.get("/api/forms", async (req, res) => {

  const projectId = req.query.projectId;

  if (!projectId) {
    return res.status(400).send("projectId required");
  }

  try {

    const token = await getAccessToken();

    const apiRes = await fetch(
      `https://developer.api.autodesk.com/construction/forms/v1/projects/${projectId}/forms`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await apiRes.json();

    res.json(data);

  } catch (err) {

    res.status(500).send(err.message);

  }

});

app.get("/", (req, res) => {
  res.send("APS Backend Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});