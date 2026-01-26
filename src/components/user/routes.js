const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const ctrl = require("../user/controller/userController");
const { verifyToken } = require("../../../middlewares/jwtVerify");
const bodyParser = require("body-parser");

const router = express.Router();


router.post("/register", upload.single("profileFile"), ctrl.register);

router.post("/login", ctrl.login);
router.post("/refresh", ctrl.refresh);
router.get("/", verifyToken, ctrl.getUsers);
router.put("/edit", verifyToken, ctrl.updateUser);
router.delete("/delete", verifyToken, ctrl.deleteUser);
router.get("/logout", verifyToken, ctrl.logout);

module.exports = router;
