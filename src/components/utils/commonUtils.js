const jwt = require("jsonwebtoken");
const config = require("../../../config/stages");

exports.success = (res, data = {}, message = "Success", status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

exports.error = (res, message = "Error", status = 500) => {
  return res.status(status).json({ success: false, message });
};

exports.generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.ACCESS_SECRET, {
    expiresIn: "30m",
  });

  const refreshToken = jwt.sign({ id: userId }, config.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

exports.errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return this.error(res, `${field} already exists`, 409);
  }

  if (err.name === "JsonWebTokenError") {
    return this.error(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return this.error(res, "Token expired", 401);
  }

  return this.error(res, err.message || "Internal Server Error", 500);
};
