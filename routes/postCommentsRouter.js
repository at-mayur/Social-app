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

// Routes for reacting on a post or a comment
router.get("/post-love/:id", passport.checkAuthentication, postController.loveReactPost);
router.get("/comment-love/:id", passport.checkAuthentication, postController.loveReactComment);

router.get("/post-haha/:id", passport.checkAuthentication, postController.hahaReactPost);
router.get("/comment-haha/:id", passport.checkAuthentication, postController.hahaReactComment);

router.get("/post-wow/:id", passport.checkAuthentication, postController.wowReactPost);
router.get("/comment-wow/:id", passport.checkAuthentication, postController.wowReactComment);

router.get("/post-sad/:id", passport.checkAuthentication, postController.sadReactPost);
router.get("/comment-sad/:id", passport.checkAuthentication, postController.sadReactComment);

router.get("/post-angry/:id", passport.checkAuthentication, postController.angryReactPost);
router.get("/comment-angry/:id", passport.checkAuthentication, postController.angryReactComment);


module.exports = router;