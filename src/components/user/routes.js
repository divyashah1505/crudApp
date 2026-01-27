const UserController = require("./controller/userController");
const { upload } = require("../utils/commonUtils"); 

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
