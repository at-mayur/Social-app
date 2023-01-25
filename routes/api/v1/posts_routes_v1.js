const express = require("express");
const postApiControllers = require("../../../controllers/api/v1/post_api");

const passport = require("passport");


const router = express.Router();


router.get("/", passport.authenticate('jwt', { session: false }), postApiControllers.fetchAllPosts);
router.get("/:id", passport.authenticate('jwt', { session: false }), postApiControllers.fetchPostDetails);
router.get("/delete/:id", passport.authenticate('jwt', { session: false }), postApiControllers.deletePost);

module.exports = router;