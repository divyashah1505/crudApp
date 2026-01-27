const jwt = require("jsonwebtoken");
const config = require("../../config/development");
const strings = require("../components/utils/appString");

const verifyToken = (req, res, next) => {
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

const isAuthenticated = (req, res, next) => {
  if (!req.cookies || !req.cookies.accessToken) {
    return res.status(401).json({
      success: false,
      message: strings.LOGIN_FIRST,
    });
  }
  next();
};

const routeArray = (array_, prefix) => {
  array_.forEach((route) => {
    const {
      method,
      path,
      controller,
      validation,
      middleware,
      isPublic = false,
    } = route;
    let middlewares = [];

    if (!isPublic) middlewares.push(verifyToken);

    if (middleware) {
      Array.isArray(middleware)
        ? middlewares.push(...middleware)
        : middlewares.push(middleware);
    }

    if (validation) {
      Array.isArray(validation)
        ? middlewares.push(...validation)
        : middlewares.push(validation);
    }

    middlewares.push(controller);
    prefix[method](path, ...middlewares);
  });
  return prefix;
};

module.exports = {
  verifyToken,
  isAuthenticated,
  routeArray,
};
