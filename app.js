const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors({ exposedHeaders: "token" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(require("./middlewares/auth"));

mongoose
  .connect(process.env.DATABASE_URL, { useNewUrlParser: true })
  .then((res) => console.log("connected to database"));

app.get("/", (req, res) =>
  res.json({
    results: [
      "www.youtube.com",
      "www.facebook.com",
      "www.instagram.com",
      "www.twitter.com",
      "discord.com",
    ],
  })
);
app.use("/user", require("./routes/user"));
app.use("/chat", require("./routes/chat"));
app.use("/child", require("./routes/child"));

let port = process.env.PORT;

if (port == null || port == "") {
  port = 5000;
}
app.listen(port, () => {
  console.log("Server started");
});
