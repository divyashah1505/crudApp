const express = require("express");
const mongoose = require("mongoose");
const config = require("../config/development");
const userRoutes = require("./components/user/routes");
const { routeArray } = require("./middleware/index"); // Import the helper
const { errorHandler } = require("./components/utils/commonUtils"); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(config.DB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Error:", err));

const userRouter = express.Router();
routeArray(userRoutes, userRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
