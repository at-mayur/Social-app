const express = require("express");
const passport = require("passport");
const localPassport = require("../config/passportAuth");
const postRoute = require("./postCommentsRouter");
const User = require("../models/user");

//import controller
const controller = require("../controllers/controller");

// router for basic operations like sign in, sign up
const router = express.Router();

// home route
router.get("/", passport.checkAuthentication, controller.homeController);

// profile page route
router.get("/profile/:id", passport.checkAuthentication, controller.profileController);

// routes for sign up, sign in, sign out
router.post("/create-user", controller.createUser);
router.get("/sign-up", controller.signUpController);
router.get("/sign-in", controller.signInController);
router.get("/sign-out", controller.removeSession);

// route for updating profile
router.post("/profile-update", passport.checkAuthentication, User.uploadProfile, controller.profileUpdateController);

// Directing all requests related to posts and comments to another route file
router.use("/post", postRoute);

// route for creating session
router.post("/create-session", passport.authenticate('local', {
    failureRedirect: "/sign-in"
}), controller.createSession);

// Routes for google authentication
router.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));
// Callback route called after successful authentication from google
router.get("/auth/google/callBack", passport.authenticate('google', { failureRedirect: "/sign-in" }), controller.createSession);

// Routes for sending and accepting friend requests
router.get("/accept-request/:id", passport.checkAuthentication ,controller.acceptRequest);
router.get("/add-friend/:id", passport.checkAuthentication, controller.addFriend);

// Route for opening chat in chat box
router.get("/open-chat/:id", passport.checkAuthentication, controller.openChat);

module.exports = router;