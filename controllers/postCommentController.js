const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");

const queue = require("../config/kue");
const commentMailWorker = require("../workers/comment_email_worker");


module.exports.createPostController = async function(request, response){

    try {
        
        let post = await Post.create({
            postContent: request.body.postContent,
            user: request.user._id
        });

        await post.populate("user", "username email");
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

        await (await comment.populate("user", "username email")).populate({
            path: "post",
            populate: {
                path: "user",
                select: "username email"
            }
        });
        // commentMailer.mailComment(comment);
        // console.log(comment.post);
        let job = queue.create('emails', comment).save(function(error){
            if(error){
                console.log("Error creating job", error);
                return;
            }

            // console.log("Job enqued - ");
        });



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

            let comments = await Comment.find({post: request.params.id});

            for(let comment of comments){
                await Like.deleteMany({target: comment.id});
            }

            await Comment.deleteMany({post: request.params.id});
            await Like.deleteMany({target: request.params.id});

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

            await Like.deleteMany({target: request.params.id});

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


module.exports.likePost = async function(request, response){

    try {
        
        let post = await Post.findById(request.params.id);

        let findLike = await Like.findOne({ target: request.params.id, user: request.user.id });

        if(findLike){
            await Post.findByIdAndUpdate(post.id, { $pull: {"likes": findLike.id}});

            await findLike.remove();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Like removed..",
                    likeAdded: false
                });
            }
        }
        else{
            let like = await Like.create({
                user: request.user._id,
                target: post._id,
                onModel: "Post"
            });

            post.likes.push(like);

            await post.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Like added..",
                    likeAdded: true
                });
            }

        }

        return response.redirect("back");

    } catch (error) {
        if(request.xhr){
            return response.status(500).json({
                message: error
            });
        }
        request.flash('error', error);
        console.log(`Error adding like to post..\n${error}`);
    }

};


module.exports.likeComment = async function(request, response){

    try {
        
        let comment = await Comment.findById(request.params.id);

        let findLike = await Like.findOne({ target: request.params.id, user: request.user.id });

        if(findLike){
            await Comment.findByIdAndUpdate(comment.id, { $pull: {"likes": findLike.id}});

            await findLike.remove();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Like removed..",
                    likeAdded: false
                });
            }
        }
        else{
            let like = await Like.create({
                user: request.user._id,
                target: comment._id,
                onModel: "Comment"
            });

            comment.likes.push(like);

            await comment.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Like added..",
                    likeAdded: true
                });
            }

        }

        return response.redirect("back");

    } catch (error) {
        if(request.xhr){
            return response.status(500).json({
                message: error
            });
        }
        console.log(`Error adding like to comment..\n${error}`);
    }

};