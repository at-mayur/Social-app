const express = require("express");

//import controller
const controller = require("../controllers/controller");

const router = express.Router();

router.get("/", controller.homeController);
router.get("/profile", controller.profileController);
router.get("/sign-up", controller.signUpController);
router.get("/sign-in", controller.signInController);



module.exports = router;