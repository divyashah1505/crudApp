const jwt = require("jsonwebtoken");
const config = require("../../../config/development");

const generateTokens = (userId) => {
  if (!config.ACCESS_SECRET || !config.REFRESH_SECRET)
    throw new Error("JWT secrets not defined");
  return {
    accessToken: jwt.sign({ id: userId }, config.ACCESS_SECRET, { expiresIn: "30m" }),
    refreshToken: jwt.sign({ id: userId }, config.REFRESH_SECRET, { expiresIn: "7d" }),
  };
};

const success = (req, res , message, statusCode = 200) => {
  return res.status(statusCode).json(message);
};

const error = (res, message = "Something went wrong", statusCode = 422) => {
  return res.status(statusCode).json({ success: false, message });
};

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
};

module.exports = { generateTokens, success, error, errorHandler };
