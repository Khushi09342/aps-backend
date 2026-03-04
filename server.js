const express = require("express");
const { spawn } = require("child_process");

const app = express();
const port = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("APS Backend Running");
});

app.get("/api/reviews", (req, res) => {
  res.send("Reviews endpoint running");
});

app.get("/api/forms", (req, res) => {
  res.send("Forms endpoint running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});