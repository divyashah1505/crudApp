const jwt = require("jsonwebtoken");
const config = require("../../../config/development");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { appString } = require("../../components/utils/appString");
const { createClient } = require("redis");
// const authHeader = req.headers['authorization'];

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect().then(() => console.log("Redis Connected"));

const uploadDir = path.join(__dirname, "../../../uploads/IMG");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storeUserToken = async (userId, token) => {
  await client.set(`auth:${userId}`, token, { expiresIn: "30m"});
};

const removeUserToken = async (userId) => {
  await client.del(`auth:${userId}`);
};

const getActiveToken = async (userId) => {
  return await client.get(`auth:${userId}`);
};

const generateTokens = async (user) => { 
  if (!config.ACCESS_SECRET || !config.REFRESH_SECRET)
    throw new Error(appString.jWTNOT_DEFINED);
  
  const payload = { id: user._id || user, role: user.role || 'user' };
  
  const accessToken = jwt.sign(payload, config.ACCESS_SECRET, { expiresIn: "30m" });
  const refreshToken = jwt.sign(payload, config.REFRESH_SECRET, { expiresIn: "7d" });

  await storeUserToken(payload.id.toString(), accessToken);

  return { accessToken, refreshToken };
};

const handleRefreshToken = async (req, res) => {
  try {
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, message: appString.REFRESHREQUIRED });

    const refreshToken = authHeader.split(' ')[1];

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: appString.REFRESHREQUIRED });
    }

    const decoded = jwt.verify(refreshToken, config.REFRESH_SECRET);
    const newTokens = await generateTokens({ _id: decoded.id, role: decoded.role });
    return res.status(200).json({ success: true, ...newTokens });
  } catch (err) {
    return res.status(403).json({ success: false, message: appString.INVALIDREFRESHTOKEN });
  }
};


const success = (res, data = {}, message, statusCode = 200) => res.status(statusCode).json({ success: true, message, data });
const error = (res, message, statusCode = 422) => res.status(statusCode).json({ success: false, message });



const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error(appString.img_ERR), false);
  }
});

const errorHandler = (err, req, res, next) => {
  console.error("Error Logged:", err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
};

module.exports = {
  upload, 
  generateTokens,
  storeUserToken,
  removeUserToken,
  getActiveToken,
  handleRefreshToken,
  success,
  error,
  errorHandler,
};
