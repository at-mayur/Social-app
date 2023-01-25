const Post = require("../../../models/post");
const Comment = require("../../../models/comment");
const url = require("url");


const jwt = require("jsonwebtoken");

require("dotenv").config();

module.exports.fetchAllPosts = async function(request, response){
    
    try {
        let posts = await Post.find({});
        let postsUrls = [];
        for(let post of posts){
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


module.exports.deletePost = async function(request, response){
    try {
        const authToken = request.headers.authorization;
        const post = await Post.findById(request.params.id);
        if(authToken){
            const jwtPayload = await jwt.verify(authToken.split(" ")[1], process.env.JWT_SECRET);
            if(jwtPayload.id!=post.user){
                return response.status(400).json({
                    msg: "You cannot delete this post"
                });
            }

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