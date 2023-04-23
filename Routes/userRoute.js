const express = require("express");
const userController = require("../Controllers/userController");
const forgotController = require("../Controllers/forgotController");
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);

// router.get("/forgot", forgotController.forgot);
// router.post("/forgot_password", forgotController.forgotPassword);
// router.get("/reset/:token", forgotController.resetPassword);
// router.post("/reset/:token", forgotController.createPassword);

router.get("/forgot", userController.forgot);
router.post("/forgot_password", userController.forgotPassword);
router.get("/reset/:token", userController.resetPassword);
router.post("/reset/:token", userController.createPassword);

router.get("/get-user", userController.getUser);
router.post("/get-user-with-email", userController.getUserWithMail);

module.exports = router;
