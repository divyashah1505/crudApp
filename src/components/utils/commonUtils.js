const jwt = require("jsonwebtoken");
const config = require("../../../config/development");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { appString } = require("../../components/utils/appString");
// conappStringngs = require("../../components/utils/appString");


const uploadDir = path.join(__dirname, "../../../uploads/IMG");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error(appString.img_ERR), false);
    }
    cb(null, true);
  }
});

const generateTokens = (user) => { 
  if (!config.ACCESS_SECRET || !config.REFRESH_SECRET)
    throw new Error(appString.jWTNOT_DEFINED);
  
  const payload = { id: user._id, role: user.role };
  
  return {
    accessToken: jwt.sign(payload, config.ACCESS_SECRET, { expiresIn: "30m" }),
    refreshToken: jwt.sign(payload, config.REFRESH_SECRET, { expiresIn: "7d" }),
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
    message: err.message || "Internal Server Error",
  });
};

module.exports = {
  upload, 
  generateTokens,
  success,
  error,
  errorHandler,
};
