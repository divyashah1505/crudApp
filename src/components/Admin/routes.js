const express = require("express");
const router = express.Router();
const adminController = require("./controller/adminController");
const { registerValidation } = require("./validation");
const { loginValidation } = require("../user/validation");
const { routeArray } = require("../../middleware");

const routes = [
  {
    path: "/registeradmin",
    method: "post",
    controller: adminController.register,
    validation: registerValidation,
    isPublic: true, 
  },
  {
    path: "/loginAdmin",
    method: "post",
    controller: adminController.login,
    validation: loginValidation,
    isPublic: true, 
  },
 {
    path: "/user-list", 
    method: "get",
    controller: adminController.userList,
    
  },
];

module.exports = routeArray(routes, router, true);
