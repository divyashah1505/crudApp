// src\middleware\index.js
const jwt = require("jsonwebtoken");
const config = require("../../config/development");
const { appString } = require("../../src/components/utils/appString");
const Validator = require("validatorjs");
// const admin = require("../components/Admin/model/admin");
const admin = require("../components/Admin/model/admin");
const user = require("../components/user/model/users");
  const { getActiveToken, } = require("../components/utils/commonUtils");

const verifyToken = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: appString.AUTHORIZATIONHEADERS });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, config.ACCESS_SECRET);

    const savedToken = await getActiveToken(decoded.id);
    // console.log(savedToken);
    

    if (!savedToken || savedToken !== token) {
      return res.status(401).json({ message: appString.SESSIONEXPIRED });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
    return res.status(401).json({ message: msg });
  }
};

const checkRole = (role) => async (req, res, next) => {
  try {
    const userId = req?.user?.id; 
    
    if (!userId) {
      return res.status(401).json({ message: appString.Unauthorized });
    }

    if (role === 1 || role === 1) {
      const adminData = await admin.find({ _id: userId }); 
      if (adminData && adminData.length > 0) {
        return next(); 
      } else {
        return res.status(403).json({ message: appString.Forbidden });
      }
    } else {
      const userData = await user.find({ _id: userId }); 
      if (userData && userData.length > 0) {
        return next(); 
      } else {
        return res.status(403).json({ message: appString.Forbidden1 });
      }
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error); 
    return res.status(500).json({ message: "Internal Server Error" });
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
const routeArray = (array_, prefix, isAdmin = false) => {
  array_.forEach((route) => {
    const { method, path, controller, validation, middleware, isPublic = false } = route;
    let middlewares = [];

    if (!isPublic) {
      middlewares.push(verifyToken);
      // if (isAdmin) {
      //   middlewares.push((req, res, next) => {
      //     if (req.user && req.user.role === 'admin') return next();
      //     return res.status(403).json({ message: appString.ADMINACCESS_DEINED });
      //   });
      // }
      middlewares.push(checkRole(isAdmin))
    }

    if (middleware) middlewares.push(...(Array.isArray(middleware) ? middleware : [middleware]));
    if (validation) middlewares.push(...(Array.isArray(validation) ? validation : [validation]));
    
    const validStack = [...middlewares, controller].filter(h => typeof h === 'function');
    prefix[method](path, ...validStack);
  });
  return prefix;
};

const validatorUtilWithCallback = (rules, customMessages, req, res, next) => {
  Validator.useLang(req?.headers?.lang ?? "en");
  const validation = new Validator(req.body, rules, customMessages);
  validation.passes(() => next());
  validation.fails(() => {
    return res.status(412).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors.all(),
    });
  });
};

module.exports = {
  verifyToken,
  isAuthenticated,
  routeArray,
  validatorUtilWithCallback,
  checkRole
};
