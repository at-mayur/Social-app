const express = require("express");
const passport = require("passport");
const localPassport = require("../config/passportAuth");
const postRoute = require("./postCommentsRouter");
const User = require("../models/user");

//import controller
const controller = require("../controllers/controller");

const router = express.Router();


router.get("/", passport.checkAuthentication, controller.homeController);
router.get("/profile/:id", passport.checkAuthentication, controller.profileController);
router.post("/create-user", controller.createUser);
router.get("/sign-up", controller.signUpController);
router.get("/sign-in", controller.signInController);
router.get("/sign-out", controller.removeSession);
router.post("/profile-update", passport.checkAuthentication, User.uploadProfile, controller.profileUpdateController);
router.use("/post", postRoute);

router.post("/create-session", passport.authenticate('local', {
    failureRedirect: "/sign-in"
}), controller.createSession);


module.exports = router;