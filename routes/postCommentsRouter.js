const postController = require("../controllers/postCommentController");
const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/", passport.checkAuthentication, postController.postController);
router.post("/create-post", passport.checkAuthentication, postController.createPostController);
router.post("/create-comment", passport.checkAuthentication, postController.createCommentController);


module.exports = router;