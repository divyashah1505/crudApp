const UserController = require("./controller/userController");
const { upload } = require("../utils/commonUtils");
const {
  loginValidation,
  registerValidation,
  AddressValidation,
} = require("./validation");
const { handleRefreshToken } = require("../../components/utils/commonUtils");

module.exports = [
  // -------- AUTH (PUBLIC) --------
  {
    path: "/register",
    method: "post",
    controller: UserController.register,
    validation: registerValidation,
    isPublic: true,
  },
  {
    path: "/login",
    method: "post",
    controller: UserController.login,
    validation: loginValidation,
    isPublic: true,
  },

  // -------- FILE UPLOAD --------
  {
    path: "/profileupload",
    method: "post",
    middleware: [upload.array("file")],
    controller: UserController.profileUpload,
    isPublic: true,
  },

  // -------- USER PROFILE --------
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

  // 🔥 USER SELF DELETE
  {
    path: "/delete",
    method: "delete",
    controller: UserController.deleteUser,
  },

  // -------- LOGOUT & TOKEN --------
  {
    path: "/logout",
    method: "post",
    controller: UserController.logout,
  },
  {
    path: "/refresh-token",
    method: "post",
    controller: handleRefreshToken,
    isPublic: true,
  },

  // -------- ADDRESS MANAGEMENT --------
  {
    path: "/add",
    method: "post",
    controller: UserController.insertAddress,
    validation: AddressValidation,
  },
  {
    path: "/listalladdress",
    method: "get",
    controller: UserController.listUserAddresses,
  },
  {
    path: "/chnageprimadd",
    method: "put",
    controller: UserController.changePrimaryAddress,
  },
];
