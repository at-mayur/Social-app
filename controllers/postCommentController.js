const Post = require("../models/post");
const Comment = require("../models/comment");


module.exports.createPostController = async function(request, response){

    try {
        
        let post = await Post.create({
            postContent: request.body.postContent,
            user: request.user._id
        });

        await post.populate("user");
        post.user.password = "";
        if(request.xhr){
            return response.status(201).json({
                post: post,
                message: "Post created Successfully!"
            });
        }

        request.flash('success', 'Post Created Successfully..');
        response.redirect("back");


    } catch (error) {
        if(request.xhr){
            return response.status(500).json({
                message: error
            });
        }
        request.flash('error', error);
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

        await comment.populate("user");
        comment.user.password = "";

        if(request.xhr){
            return response.status(201).json({
                comment: comment,
                message: "Comment added Successfully"
            });
        }

        request.flash('success', 'Comment added Successfully..');
        return response.redirect("back");


    } catch (error) {
        if(request.xhr){
            return response.status(500).json({
                message: error
            });
        }
        request.flash('error', error);
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

            // console.log(request.xhr);
            if(request.xhr){
                return response.status(200).json({
                    post: request.params.id,
                    message: "Post deleted Successfully"
                });
            }
        }

        request.flash('success', 'Post deleted Successfully..');
        return response.redirect("back");


    } catch (error) {
        if(request.xhr){
            return response.status(500).json({
                message: error
            });
        }
        request.flash('error', error);
        console.log(`Error deleting comments on that post..\n${error}`);
    }
    
    
};

module.exports.deleteCommentController = async function(request, response){

    try {
        let comment = await Comment.findById(request.params.id).populate("user post");

        if(request.user && (request.user.id==comment.user.id || request.user.id==comment.post.user)){
            let post = await Post.findByIdAndUpdate(comment.post.id, { $pull: {'comments': comment.id}});
            await comment.remove();

            // console.log(request.xhr);
            if(request.xhr){
                return response.status(200).json({
                    comment: request.params.id,
                    message: "Comment deleted Successfully"
                });
            }
        }

        request.flash('success', 'Comment deleted Successfully..');
        return response.redirect("back");


    } catch (error) {
        if(request.xhr){
            return response.status(500).json({
                message: error
            });
        }
        request.flash('error', error);
        console.log(`Error deleting comment from post Array..\n${error}`);
    }


    
};