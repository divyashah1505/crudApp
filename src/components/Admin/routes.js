const express = require("express");
const router = express.Router();

const adminController = require("./controller/adminController");
const categoryController = require("./controller/categoryController ");

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
  {
    path: "/user/status",
    method: "put",
    controller: adminController.updateUserStatus,
  },
  {
    path: "/user/activate/:userId",
    method: "put",
    controller: adminController.activateUser,
  },
  {
    path: "/user/:userId",
    method: "delete",
    controller: adminController.deleteUser,
  },

  {
    path: "/category",
    method: "post",
    controller: categoryController.addCategory,
  },
  {
    path: "/list-categoriesdetails",
    method: "get",
    controller: categoryController.listCategories,
  },
  {
    path: "/category/:id",
    method: "put",
    controller: categoryController.updateCategory,
  },
  {
    path: "/category/:id",
    method: "delete",
    controller: categoryController.deleteCategory,
  },
];

module.exports = routeArray(routes, router, true);
