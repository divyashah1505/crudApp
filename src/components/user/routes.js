const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const UserController = require("./controller/userController");
// const V = require("./userValidation"); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = [
     {
        path: "/register",
        method: "post",
        middleware: [upload.single("file")], 
        controller: UserController.register,
        isPublic: true,
    },
     {
        path: "/login",
        method: "post",
        controller: UserController.login,
        isPublic: true,
    },
      {
        path: "/profile",
        method: "get",
        controller: UserController.getProfile,
        isPublic: false,
    },
      {
        path: "/update",
        method: "put",
        controller: UserController.updateUser,
        isPublic: false,
    },
      {
        path: "/delete",
        method: "delete",
        controller: UserController.deleteUser,
        isPublic: false,
    },
      {
        path: "/logout",
        method: "post",
        controller: UserController.logout,
        isPublic: true,
    }
];
