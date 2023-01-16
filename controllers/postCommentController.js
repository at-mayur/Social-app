const Post = require("../models/post");
const Comment = require("../models/comment");


module.exports.createPostController = async function(request, response){

    try {
        await Post.create({
            postContent: request.body.postContent,
            user: request.user._id
        });

        response.redirect("back");


    } catch (error) {
        console.log(`Error adding post to DB..\n${error}`);
    }
    
};

module.exports.createCommentController = async function(request, response){

    try {
        
        let post = await Post.findById(request.body.post);

        let comment = await Comment.create({
            commentContent: request.body.commentContent,
            user: request.user._id,
            post: post._id
        });

        post.comments.push(comment._id);
        await post.save();

        return response.redirect("back");


    } catch (error) {
        console.log(`Error adding Comment to DB..\n${error}`);
    }
    
};

module.exports.deletePostController = async function(request, response){
    // console.log(request.params);

    try {
        let post = await Post.findById(request.params.id);

        if(request.user && request.user.id==post.user){
            await post.remove();

            let comment = await Comment.deleteMany({post: request.params.id});
        }

        return response.redirect("back");


    } catch (error) {
        console.log(`Error deleting comments on that post..\n${error}`);
    }
    
    
};

module.exports.deleteCommentController = async function(request, response){

    try {
        let comment = await Comment.findById(request.params.id).populate("user post");

        if(request.user && (request.user.id==comment.user.id || request.user.id==comment.post.user)){
            let post = await Post.findByIdAndUpdate(comment.post.id, { $pull: {'comments': comment.id}});
        }

        await comment.remove();

        return response.redirect("back");


    } catch (error) {
        console.log(`Error deleting comment from post Array..\n${error}`);
    }


    
};