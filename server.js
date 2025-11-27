

const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb"); 

const app = express();


app.use(express.json());
app.set("port", 3000);

let db;

MongoClient.connect(
  "mongodb+srv://hm1150_db_user:hafsah1150@cluster0.ppahqwe.mongodb.net/",
  (err, client) => {
    if (err) {
      console.error("MongoDB Connection Error:", err);
      return;
    }
    db = client.db("webstore");
    console.log("Connected to MongoDB (webstore)");
  }
);

function ensureDb(req, res, next) {
  if (!db) return res.status(503).json({ error: "DB not ready" });
  next();
}

app.get("/", (req, res) => {
  res.send("API running. Try GET /lessons");
});

app.get("/lessons", ensureDb, (req, res, next) => {
  db.collection("lessons")
    .find({})
    .toArray((err, results) => {
      if (err) return next(err);
      res.json(results);
    });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});


app.listen(app.get("port"), () => {
  console.log(`Server running on http://localhost:${app.get("port")}`);
});
