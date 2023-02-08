const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");

const queue = require("../config/kue");
const commentMailWorker = require("../workers/comment_email_worker");

// controller for creating a post
module.exports.createPostController = async function(request, response){

    try {
        
        // create a post with input data
        let post = await Post.create({
            postContent: request.body.postContent,
            user: request.user._id
        });

        // populate user field for post
        await post.populate("user", "username email");
        if(request.xhr){
            return response.status(201).json({
                post: post,
                message: "Post created Successfully!"
            });
        }

        // Setting flash msg
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
        
        // fetch post for which comment has to br created
        let post = await Post.findById(request.body.post);

        // create comment
        let comment = await Comment.create({
            commentContent: request.body.commentContent,
            user: request.user._id,
            post: post._id
        });

        // add comment to posts comments array
        post.comments.push(comment._id);
        await post.save();

        // populate comments all fields
        await (await comment.populate("user", "username email")).populate({
            path: "post",
            populate: {
                path: "user",
                select: "username email"
            }
        });
        // below lines for sending mails without queue
        // commentMailer.mailComment(comment);
        // console.log(comment.post);

        // Send mail on commenting a post using queue
        // parallel jobs
        // Creating new job for emails process with comment as data
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

// controller for deleting a post
module.exports.deletePostController = async function(request, response){
    // console.log(request.params);

    try {
        // fetching post which needs to be deleted
        let post = await Post.findById(request.params.id);

        // check if current authenticated user and post creator is same
        if(request.user && request.user.id==post.user){
            await post.remove();

            // fetch all associated comments
            let comments = await Comment.find({post: request.params.id});

            // delete likes on comments
            for(let comment of comments){
                await Like.deleteMany({target: comment.id});
            }

            // delete all associated comments
            await Comment.deleteMany({post: request.params.id});

            // delete all likes of post
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

// controller for deleting a comment
module.exports.deleteCommentController = async function(request, response){

    try {
        // fetch comment
        let comment = await Comment.findById(request.params.id).populate("user post");

        // check if current authenticated user is comment creator or post creator on which comment is present
        if(request.user && (request.user.id==comment.user.id || request.user.id==comment.post.user)){
            // find respective post and remove comment from it's comments list
            let post = await Post.findByIdAndUpdate(comment.post.id, { $pull: {'comments': comment.id}});
            await comment.remove();

            // delete all likes for comment
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

// controller for liking a post
module.exports.likePost = async function(request, response){

    try {
        
        // fetch the post
        let post = await Post.findById(request.params.id);

        // find if like already exists for that post from current user
        let findLike = await Like.findOne({ target: request.params.id, user: request.user.id });

        // if like already present then remove that like
        if(findLike){
            // removing that like from posts like list
            await Post.findByIdAndUpdate(post.id, { $pull: {"likes": findLike.id}});

            await findLike.remove();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Like removed..",
                    likeAdded: false
                });
            }
        }
        // if like is not present then add one
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

// controller for liking a comment
module.exports.likeComment = async function(request, response){

    try {
        
        // fetch comment
        let comment = await Comment.findById(request.params.id);

        // find if like already exists for that comment from current user
        let findLike = await Like.findOne({ target: request.params.id, user: request.user.id });

        // if like already present then remove that like
        if(findLike){
            // removing that like from comments like list
            await Comment.findByIdAndUpdate(comment.id, { $pull: {"likes": findLike.id}});

            await findLike.remove();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Like removed..",
                    likeAdded: false
                });
            }
        }
        // if like is not present then add one
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