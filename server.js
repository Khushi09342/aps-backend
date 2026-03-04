const express = require("express");
const app = express();
const port = process.env.PORT || 7071;

require("./src/functions/reviews");
require("./src/functions/forms");
require("./src/functions/login");
require("./src/functions/callback");

app.get("/", (req, res) => {
  res.send("APS Backend Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});