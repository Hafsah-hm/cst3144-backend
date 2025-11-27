

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


app.listen(app.get("port"), () => {
  console.log(`Server running on http://localhost:${app.get("port")}`);
});
