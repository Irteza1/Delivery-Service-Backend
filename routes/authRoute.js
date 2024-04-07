const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/verify/:id", authController.verify);

router.post("/forgot", authController.forgotPassword);

router.post("/reset/:token", authController.resetPassword);

module.exports = router;
