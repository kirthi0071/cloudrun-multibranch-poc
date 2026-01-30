const express = require("express");
const app = express();

app.get("/", (req,res) => {
  res.send("Hello from Jenkins Multibranch Pipeline 1!");
});

app.listen(8080, () => console.log("App running"));
