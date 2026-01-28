const UserController = require("./controller/userController");
const { upload } = require("../utils/commonUtils");

module.exports = [
  {
    path: "/register",
    method: "post",
    controller: UserController.register,
    isPublic: true,
  },
  {
    path: "/profileupload",
    method: "post",
    middleware: [ upload.array('file')],
    controller: UserController.profileUpload,
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
   
  },
  {
    path: "/update",
    method: "put",
    controller: UserController.updateUser,
    
  },
  {
    path: "/delete",
    method: "delete",
    controller: UserController.deleteUser,
  },
  {
    path: "/logout",
    method: "post",
    controller: UserController.logout,
  },
];
