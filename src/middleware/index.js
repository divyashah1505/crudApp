const jwt = require("jsonwebtoken");
const config = require("../../config/stages");

exports.verifyToken = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Token missing" });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, config.ACCESS_SECRET);

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
