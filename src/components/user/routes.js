const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const ctrl = require("./controller/userController");
const { verifyToken } = require("../../middleware");

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// routes
router.post("/register", upload.single("profileFile"), ctrl.register);

router.post("/login", ctrl.login);
router.get("/profile", verifyToken, ctrl.getProfile);
router.put("/update", verifyToken, ctrl.updateUser);
router.delete("/delete", verifyToken, ctrl.deleteUser);

module.exports = router;
