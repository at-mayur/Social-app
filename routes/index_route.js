const express = require("express");
const passport = require("passport");
const localPassport = require("../config/passportAuth");

//import controller
const controller = require("../controllers/controller");

const router = express.Router();

router.get("/", controller.homeController);
router.get("/profile", localPassport.checkAuthentication, controller.profileController);
router.get("/sign-up", controller.signUpController);
router.get("/sign-in", controller.signInController);
router.get("/sign-out", controller.removeSession);

router.post("/create-session", passport.authenticate('local', {
    failureRedirect: "/sign-in"
}), controller.createSession);


module.exports = router;