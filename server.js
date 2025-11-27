

const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb"); 

const app = express();


app.use(express.json());
app.set("port", 3000);

app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  if (Object.keys(req.body || {}).length > 0) {
    console.log("  Body:", req.body);
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});


app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

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

app.get("/images/:imageName", (req, res) => {
  const filePath = path.join(__dirname, "images", req.params.imageName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).json({ error: "Image not found" });
    res.sendFile(filePath);
  });
});

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

app.put("/lessons/:id", ensureDb, (req, res, next) => {
  const lessonId = parseInt(req.params.id, 10);

  if (Number.isNaN(lessonId)) {
    return res.status(400).json({ error: "Lesson ID must be a number" });
  }

  db.collection("lessons").updateOne(
    { id: lessonId },       // numeric id field in your documents
    { $set: req.body },
    (err, result) => {
      if (err) return next(err);
      if (!result.matchedCount) {
        return res.status(404).json({ msg: "Lesson not found" });
      }
      res.json({ msg: "success", modified: result.modifiedCount });
    }
  );
});

app.post("/orders", ensureDb, (req, res, next) => {
  const order = req.body || {};

  // Expect: { name, phone, lessons: [{id, qty}, ...] }
  if (!order.name || !order.phone || !Array.isArray(order.lessons)) {
    return res.status(400).json({
      error:
        "Invalid order. Provide {name, phone, lessons:[{id,qty}, ...]}",
    });
  }

  db.collection("orders").insertOne(order, (err, result) => {
    if (err) return next(err);
    console.log("Order inserted:", result.insertedId);
    res.status(201).json({ message: "Order Saved", orderId: result.insertedId });
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});


app.listen(app.get("port"), () => {
  console.log(`Server running on http://localhost:${app.get("port")}`);
});
