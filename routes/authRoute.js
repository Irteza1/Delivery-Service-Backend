const express = require("express");
const router = express.Router();
const passport = require('passport');
const authController = require("../controller/authController");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/verify/:id", authController.verify);

router.post("/forgot", authController.forgotPassword);

router.post("/reset/:token", authController.resetPassword);

router.get("/users", authController.users); // added this route for testing purposes. Can be removed.

router.get("/users/:id", authController.userById);

router.put("/users/:id", authController.updateUser);

router.post("/authorize", authController.authorize);

router.get('/auth/google',
    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email']
    }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.REDIRECT_URL_FAILURE }),
    async function (req, res) {
        const data = await authController.googleLogin(req, res);
        if (data.status && data.error) {
            res.redirect(process.env.REDIRECT_URL_FAILURE);
        }
        res.redirect(`${process.env.REDIRECT_URL_SUCCESS}?token=${data?.token}&_id=${data?.user?._id}&access_token=${req?.user?.access_token}`);
    });

module.exports = router;
