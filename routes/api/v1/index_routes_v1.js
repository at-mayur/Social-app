const express = require("express");
const postApiRoutes = require("./posts_routes_v1");

const userSignIn = require("../../../controllers/api/v1/user_api");

const router = express.Router();

router.post("/create-session", userSignIn.createSession);
router.use("/posts", postApiRoutes);
router.use("/post", postApiRoutes);

module.exports = router;