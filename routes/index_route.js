const express = require("express");

//import controller
const controller = require("../controllers/controller");

const router = express.Router();

router.get("/", controller.homeController);
router.get("/profile", controller.profileController);
router.get("/sign-up", controller.signUpController);
router.get("/sign-in", controller.signInController);
router.get("/sign-out", controller.signOutController);
router.post("/create-user", controller.createUser);
router.post("/create-session", controller.createSession);


module.exports = router;