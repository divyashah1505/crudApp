const express = require("express");
const router = express.Router();

const adminController = require("./controller/adminController");
const { registerValidation } = require("./validation");
const { loginValidation } = require("../user/validation");
const { routeArray } = require("../../middleware");

const routes = [
  // -------- ADMIN AUTH --------
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

  // -------- USER MANAGEMENT --------

  // 🔥 ADMIN USER LIST (AGGREGATE + deletedUser FILTER)
  {
    path: "/user-list",
    method: "get",
    controller: adminController.userList,
  },

  // 🔥 ACTIVATE / DEACTIVATE USER
  {
    path: "/user/status",
    method: "put",
    controller: adminController.updateUserStatus,
  },

  // 🔥 ADMIN DELETE USER
  {
    path: "/user/:userId",
    method: "delete",
    controller: adminController.deleteUser,
  },
];

module.exports = routeArray(routes, router, true);
