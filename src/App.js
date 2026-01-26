const express = require("express");
const mongoose = require("mongoose");
const config = require("../config/development");
const userRoutes = require("./components/user/routes");
const { errorHandler } = require("./components/utils/commonUtils"); // make sure it's exported

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
mongoose
  .connect(config.DB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Error:", err));

// Routes
app.use("/api/users", userRoutes);

// Global Error Handler (must be AFTER routes)
app.use(errorHandler);

// Start server
app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
