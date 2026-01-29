const UserController = require("./controller/userController");
const { upload } = require("../utils/commonUtils");
const { loginValidation, registerValidation,AddressValidation,} = require("./validation");
const userController = require("./controller/userController");

module.exports = [
  {
    path: "/register",
    method: "post",
    controller: UserController.register,
    validation:registerValidation,
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
    validation:loginValidation,
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
  {
    path:"/add",
    method:"post",
    controller:UserController.insertAddress,
    validation:AddressValidation
  },
  {
    path:"/listalladdress",
    method:"get",
    controller:userController.listUserAddresses
  },
  {
    path:"/chnageprimadd",
    method:"put",
    controller:userController.changePrimaryAddress
  },

];
