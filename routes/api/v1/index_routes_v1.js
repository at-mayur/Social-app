const express = require("express");
const postApiRoutes = require("./posts_routes_v1");

const userSignIn = require("../../../controllers/api/v1/user_api");

// Index route for API v1
// Directs to respective users and posts route
const router = express.Router();

// route for JWT token creation
router.post("/create-session", userSignIn.createSession);

// routes for fetching posts
router.use("/posts", postApiRoutes);
router.use("/post", postApiRoutes);

module.exports = router;