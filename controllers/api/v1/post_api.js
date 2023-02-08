const Post = require("../../../models/post");
const Comment = require("../../../models/comment");
const url = require("url");


const jwt = require("jsonwebtoken");

require("dotenv").config();

// API Controller to get all posts
module.exports.fetchAllPosts = async function(request, response){
    
    try {
        let posts = await Post.find({});
        let postsUrls = [];
        for(let post of posts){
            // Parsing url for every individual post
            postsUrls.push(url.parse(`/api/v1/post/${post.id}`).path);
        }

        return response.status(200).json({
            posts: postsUrls,
            message: "Fetched all posts successfully"
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            message: "Error occured while fetching posts..!"
        });
    }


};


// Controller to get individual post data
module.exports.fetchPostDetails = async function(request, response){
    
    try {
        let post = await Post.findById(request.params.id).populate("comments");

        return response.status(200).json({
            post: post,
            message: "Fetched Post Successfully..!!"
        });

    } catch (error) {
        console.log("Error fetching post!", error);
        return response.status(500).json({
            message: "Error fetching post!"
        });
    }
};

// API controller for deleting a post
module.exports.deletePost = async function(request, response){
    try {
        const authToken = request.headers.authorization;
        const post = await Post.findById(request.params.id);
        if(authToken){
            // Authorization header contains token as "bearer <JWT token>"
            // Hence splitting string
            const jwtPayload = await jwt.verify(authToken.split(" ")[1], process.env.JWT_SECRET);

            // authenticated user and post creator is different don't allow to delete
            if(jwtPayload.id!=post.user){
                return response.status(400).json({
                    msg: "You cannot delete this post"
                });
            }

            // authenticated user and post creator is same hence deleting post and all associated comments
            await Comment.deleteMany({ post: post.id });
            post.remove();
            return response.status(200).json({
                msg: "Post and associated comments deleted successfully"
            });
            
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            msg: "Internal server Error"
        });
    }
};