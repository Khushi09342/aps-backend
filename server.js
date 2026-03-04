const express = require("express");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 10000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.get("/", (req, res) => {
  res.send("APS Backend Running");
});

app.get("/api/reviews", async (req, res) => {
  const projectId = req.query.projectId;

  if (!projectId) {
    return res.status(400).send("projectId required");
  }

  try {
    const tokenRes = await fetch("https://developer.api.autodesk.com/authentication/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=client_credentials&scope=data:read&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const reviewsRes = await fetch(
      `https://developer.api.autodesk.com/construction/reviews/v1/projects/${projectId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const reviews = await reviewsRes.json();
    res.json(reviews);
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
    const tokenRes = await fetch("https://developer.api.autodesk.com/authentication/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=client_credentials&scope=data:read&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const formsRes = await fetch(
      `https://developer.api.autodesk.com/construction/forms/v1/projects/${projectId}/forms`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const forms = await formsRes.json();
    res.json(forms);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});