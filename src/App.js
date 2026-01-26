const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("../src/components/user/routes");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://localhost:27017/user")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("DB Connection Error:", err));

app.use("/api/users", userRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
