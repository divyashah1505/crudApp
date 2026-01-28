const jwt = require("jsonwebtoken");
const config = require("../../config/development");
const { appString } = require("../../src/components/utils/appString");
// const appString = require("../components/utils/appString");
const commonUtils = require("../components/utils/commonUtils")
const verifyToken = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(401).json({ message: appString.TOKEN_MISSING });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, config.ACCESS_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: appString.TOKEN_EXPIRED });
  }
};
const isAuthenticated = (req, res, next) => {
  if (!req.cookies || !req.cookies.accessToken) {
    return res.status(401).json({
      success: false,
      message: appString.LOGIN_FIRST,
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
const validatorUtilWithCallback = (rules, customMessages, req, res, next) => {
  Validator.useLang(req.headers.lang ?? "en");

  const validation = new Validator(req.body, rules, customMessages);

  validation.passes(() => next());

  validation.fails(() =>
    commonUtils.sendError(req, res, {
      errors: commonUtils.error(validation.errors.errors),
    }),
  );
};
module.exports = {
  verifyToken,
  isAuthenticated,
  routeArray,
  validatorUtilWithCallback,
};
