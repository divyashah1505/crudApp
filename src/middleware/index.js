const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `${field} already exists`,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;

const ACCESS_SECRET = "access_secret_123";

const jwt = require("jsonwebtoken");
exports.verifyToken = async (req, res, next) => {
  const data = req.headers["authorization"];
  const splitToken = data.split(" ")[1];

  const jwtData = await jwt.verify(splitToken, ACCESS_SECRET);
  console.log(jwtData.id);
  if (!jwtData) {
    return res.status(400).json({ msg: "Invalid token" });
  }

  if (new Date() > jwtData.exp * 1000) {
    return res.status(400).json({ msg: "token is expired token" });
  } else {
    req.headers.id = jwtData.id;
    console.log("Redirected to next");
    next();
  }
};
