const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const config = require("../config/development");
const userRoutes = require("./components/user/routes");
const { routeArray } = require("./middleware/index"); 
const { errorHandler } = require("./components/utils/commonUtils"); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

mongoose
  .connect(config.DB_URL)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error(" DB Connection Error:", err));

const userRouter = express.Router();
routeArray(userRoutes, userRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
