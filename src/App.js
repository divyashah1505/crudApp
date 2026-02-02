const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const config = require("../config/development");
const userRoutes = require("./components/user/routes");
const adminRouter = require("./components/Admin/routes");

const { routeArray } = require("./middleware/index");
const { errorHandler } = require("./components/utils/commonUtils");
const router =require("../src//components/user/index")
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

mongoose
  .connect(config.DB_URL)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error(" DB Connection Error:", err));


app.use("/api/users",router);
app.use("/api/admin", adminRouter); 
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`),
);
