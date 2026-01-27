const jwt = require("jsonwebtoken");
const config = require("../../../config/development");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const generateTokens = (userId) => {
  if (!config.ACCESS_SECRET || !config.REFRESH_SECRET)
    throw new Error("JWT secrets not defined");
  return {
    accessToken: jwt.sign({ id: userId }, config.ACCESS_SECRET, { expiresIn: "30m" }),
    refreshToken: jwt.sign({ id: userId }, config.REFRESH_SECRET, { expiresIn: "7d" }),
  };
};

const success = (res, data = {}, message, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message, statusCode = 422) => {
  return res.status(statusCode).json({ success: false, message });
};

const errorHandler = (err, req, res, next) => {
  console.error("Error Logged:", err);
  res.status(err.statusCode || 500).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
};

module.exports = { 
  upload, 
  generateTokens, 
  success, 
  error, 
  errorHandler 
};
