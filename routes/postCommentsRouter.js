const postController = require("../controllers/postCommentController");
const express = require("express");
const passport = require("passport");

const router = express.Router();

router.post("/create-post", passport.checkAuthentication, postController.createPostController);
router.post("/create-comment", passport.checkAuthentication, postController.createCommentController);
router.get("/post-delete/:id", passport.checkAuthentication, postController.deletePostController);
router.get("/delete-comment/:id", passport.checkAuthentication, postController.deleteCommentController);


module.exports = router;