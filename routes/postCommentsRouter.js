const postController = require("../controllers/postCommentController");
const express = require("express");
const passport = require("passport");

// Router for post, comments related requests
const router = express.Router();

// Routes for creating post, comment
router.post("/create-post", passport.checkAuthentication, postController.createPostController);
router.post("/create-comment", passport.checkAuthentication, postController.createCommentController);

// Routes for deleting a post or a comment
router.get("/post-delete/:id", passport.checkAuthentication, postController.deletePostController);
router.get("/delete-comment/:id", passport.checkAuthentication, postController.deleteCommentController);

// Routes for liking a post or a comment
router.get("/post-like/:id", passport.checkAuthentication, postController.likePost);
router.get("/comment-like/:id", passport.checkAuthentication, postController.likeComment);


module.exports = router;