const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");

// Reaction models
const Love = require("../models/love");
const Haha = require("../models/haha");
const Wow = require("../models/wow");
const Sad = require("../models/sad");
const Angry = require("../models/angry");

const path = require("path");
const fs = require("fs");

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

        // If request contains file uploaded with it. Save it to destination.
        if(request.file){
            post.postImage = Post.postImagePath + request.file.filename;
        }

        post.save();

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
        console.log(`Error adding post to DB..\n${error}`);
        if(request.xhr){
            return response.status(500).json({
                message: error
            });
        }
        request.flash('error', error);
        
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

            // Remove image uploaded with post.
            if(post.postImage){
                if(fs.existsSync(path.join(__dirname, "..", post.postImage))){
                    fs.unlinkSync(path.join(__dirname, "..", post.postImage));
                }
            }

            await post.remove();

            // fetch all associated comments
            let comments = await Comment.find({post: request.params.id});

            // delete likes on comments
            for(let comment of comments){
                await Like.deleteMany({target: comment.id});
                await Love.deleteMany({target: comment.id});
                await Haha.deleteMany({target: comment.id});
                await Wow.deleteMany({target: comment.id});
                await Sad.deleteMany({target: comment.id});
                await Angry.deleteMany({target: comment.id});
            }

            // delete all associated comments
            await Comment.deleteMany({post: request.params.id});

            // delete all likes of post
            await Like.deleteMany({target: request.params.id});
            await Love.deleteMany({target: request.params.id});
            await Haha.deleteMany({target: request.params.id});
            await Wow.deleteMany({target: request.params.id});
            await Sad.deleteMany({target: request.params.id});
            await Angry.deleteMany({target: request.params.id});

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
            await Love.deleteMany({target: request.params.id});
            await Haha.deleteMany({target: request.params.id});
            await Wow.deleteMany({target: request.params.id});
            await Sad.deleteMany({target: request.params.id});
            await Angry.deleteMany({target: request.params.id});

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

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, post.id, "like", "post");
        // if like already present then remove that like
        if(findLike){
            // removing that like from posts like list
            await Post.findByIdAndUpdate(post.id, { $pull: {"likes": findLike.id}});
        
            await findLike.remove();
            post = await Post.findById(request.params.id);
            if(request.xhr){
                return response.status(200).json({
                    msg: "Like removed..",
                    reactAdded: "like",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    likeAdded: false,
                    user: request.user,
                    target: post
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
                    reactAdded: "like",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    likeAdded: true,
                    user: request.user,
                    target: post
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

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, comment.id, "like", "comment");

        // if like already present then remove that like
        if(findLike){
            // removing that like from comments like list
            comment = await Comment.findByIdAndUpdate(comment.id, { $pull: {"likes": findLike.id}});

            await findLike.remove();
            comment = await Comment.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Like removed..",
                    reactAdded: "like",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    likeAdded: false,
                    user: request.user,
                    target: comment
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
                    reactAdded: "like",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    likeAdded: true,
                    user: request.user,
                    target: comment
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


async function getReactCount(target){
    await target.populate("likes loves hahas wows sads angrys");
    let count = target.likes.length + target.loves.length + target.hahas.length
    + target.wows.length + target.sads.length + target.angrys.length;
    return count;
}


// Functions to get reaction on post or comment
async function removePrevReaction(request, targetId, reactName, targetName){

    try {
        // declare variable to store which reaction has been removed
        let reactionRemoved = "";

        // Get reaction from DB
        let likeFound = await Like.findOne({ user: request.user.id, target: targetId });
        let loveFound = await Love.findOne({ user: request.user.id, target: targetId });
        let hahaFound = await Haha.findOne({ user: request.user.id, target: targetId });
        let wowFound = await Wow.findOne({ user: request.user.id, target: targetId });
        let sadFound = await Sad.findOne({ user: request.user.id, target: targetId });
        let angryFound = await Angry.findOne({ user: request.user.id, target: targetId });

        // if any of reaction exists then update reaction value
        if(likeFound && reactName!="like"){
            if(targetName=="post"){
                await Post.findByIdAndUpdate(targetId, { $pull: {"likes": likeFound.id}});
            }
            else if(targetName=="comment"){
                await Comment.findByIdAndUpdate(targetId, { $pull: {"likes": likeFound.id}});
            }
            await likeFound.remove();

            reactionRemoved = "like";
        }
        if(loveFound && reactName!="love"){
            if(targetName=="post"){
                await Post.findByIdAndUpdate(targetId, { $pull: {"loves": loveFound.id}});
            }
            else if(targetName=="comment"){
                await Comment.findByIdAndUpdate(targetId, { $pull: {"loves": loveFound.id}});
            }
            await loveFound.remove();

            reactionRemoved = "love";
        }
        if(hahaFound && reactName!="haha"){
            if(targetName=="post"){
                await Post.findByIdAndUpdate(targetId, { $pull: {"hahas": hahaFound.id}});
            }
            else if(targetName=="comment"){
                await Comment.findByIdAndUpdate(targetId, { $pull: {"hahas": hahaFound.id}});
            }
            await hahaFound.remove();

            reactionRemoved = "haha";
        }
        if(wowFound && reactName!="wow"){
            if(targetName=="post"){
                await Post.findByIdAndUpdate(targetId, { $pull: {"wows": wowFound.id}});
            }
            else if(targetName=="comment"){
                await Comment.findByIdAndUpdate(targetId, { $pull: {"wows": wowFound.id}});
            }
            await wowFound.remove();

            reactionRemoved = "wow";
        }
        if(sadFound && reactName!="sad"){
            if(targetName=="post"){
                await Post.findByIdAndUpdate(targetId, { $pull: {"sads": sadFound.id}});
            }
            else if(targetName=="comment"){
                await Comment.findByIdAndUpdate(targetId, { $pull: {"sads": sadFound.id}});
            }
            await sadFound.remove();

            reactionRemoved = "sad";
        }
        if(angryFound && reactName!="angry"){
            if(targetName=="post"){
                await Post.findByIdAndUpdate(targetId, { $pull: {"angrys": angryFound.id}});
            }
            else if(targetName=="comment"){
                await Comment.findByIdAndUpdate(targetId, { $pull: {"angrys": angryFound.id}});
            }
            await angryFound.remove();

            reactionRemoved = "angry";
        }

        return reactionRemoved;

    } catch (error) {
        console.log(error);
    }

}


// Reactions on post
// Love reaction on post
module.exports.loveReactPost = async function(request, response){

    try {
        
        // fetch the post
        let post = await Post.findById(request.params.id);

        // find if reaction already exists for that post from current user
        let findLove = await Love.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, post.id, "love", "post");

        // if love already present then remove that like
        if(findLove){
            // removing that love from posts like list
            await Post.findByIdAndUpdate(post.id, { $pull: {"loves": findLove.id}});

            await findLove.remove();

            post = await Post.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Love removed..",
                    reactAdded: "love",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    loveAdded: false,
                    user: request.user,
                    target: post
                });
            }
        }
        // if love is not present then add one
        else{
            let love = await Love.create({
                user: request.user._id,
                target: post._id,
                onModel: "Post"
            });

            post.loves.push(love);

            await post.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Love added..",
                    reactAdded: "love",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    loveAdded: true,
                    user: request.user,
                    target: post
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

// Haha reaction on post
module.exports.hahaReactPost = async function(request, response){

    try {
        
        // fetch the post
        let post = await Post.findById(request.params.id);

        // find if reaction already exists for that post from current user
        let findHaha = await Haha.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, post.id, "haha", "post");

        // if haha already present then remove that like
        if(findHaha){
            // removing that haha from posts like list
            await Post.findByIdAndUpdate(post.id, { $pull: {"hahas": findHaha.id}});

            await findHaha.remove();

            post = await Post.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Haha removed..",
                    reactAdded: "haha",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    hahaAdded: false,
                    user: request.user,
                    target: post
                });
            }
        }
        // if haha is not present then add one
        else{
            let haha = await Haha.create({
                user: request.user._id,
                target: post._id,
                onModel: "Post"
            });

            post.hahas.push(haha);

            await post.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Haha added..",
                    reactAdded: "haha",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    hahaAdded: true,
                    user: request.user,
                    target: post
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

// Wow reaction on post
module.exports.wowReactPost = async function(request, response){

    try {
        
        // fetch the post
        let post = await Post.findById(request.params.id);

        // find if reaction already exists for that post from current user
        let findWow = await Wow.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, post.id, "wow", "post");

        // if wow already present then remove that like
        if(findWow){
            // removing that wow from posts like list
            await Post.findByIdAndUpdate(post.id, { $pull: {"wows": findWow.id}});

            await findWow.remove();

            post = await Post.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Wow removed..",
                    reactAdded: "wow",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    wowAdded: false,
                    user: request.user,
                    target: post
                });
            }
        }
        // if wow is not present then add one
        else{
            let wow = await Wow.create({
                user: request.user._id,
                target: post._id,
                onModel: "Post"
            });

            post.wows.push(wow);

            await post.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Wow added..",
                    reactAdded: "wow",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    wowAdded: true,
                    user: request.user,
                    target: post
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

// Sad reaction on post
module.exports.sadReactPost = async function(request, response){

    try {
        
        // fetch the post
        let post = await Post.findById(request.params.id);

        // find if reaction already exists for that post from current user
        let findSad = await Sad.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, post.id, "sad", "post");

        // if sad already present then remove that like
        if(findSad){
            // removing that sad from posts like list
            await Post.findByIdAndUpdate(post.id, { $pull: {"sads": findSad.id}});

            await findSad.remove();

            post = await Post.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Sad removed..",
                    reactAdded: "sad",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    sadAdded: false,
                    user: request.user,
                    target: post
                });
            }
        }
        // if sad is not present then add one
        else{
            let sad = await Sad.create({
                user: request.user._id,
                target: post._id,
                onModel: "Post"
            });

            post.sads.push(sad);

            await post.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Sad added..",
                    reactAdded: "sad",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    sadAdded: true,
                    user: request.user,
                    target: post
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

// Angry reaction on post
module.exports.angryReactPost = async function(request, response){

    try {
        
        // fetch the post
        let post = await Post.findById(request.params.id);

        // find if reaction already exists for that post from current user
        let findAngry = await Angry.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, post.id, "angry", "post");

        // if angry already present then remove that like
        if(findAngry){
            // removing that angry from posts like list
            await Post.findByIdAndUpdate(post.id, { $pull: {"angrys": findAngry.id}});

            await findAngry.remove();

            post = await Post.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Angry removed..",
                    reactAdded: "angry",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    angryAdded: false,
                    user: request.user,
                    target: post
                });
            }
        }
        // if angry is not present then add one
        else{
            let angry = await Angry.create({
                user: request.user._id,
                target: post._id,
                onModel: "Post"
            });

            post.angrys.push(angry);

            await post.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Angry added..",
                    reactAdded: "angry",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(post),
                    angryAdded: true,
                    user: request.user,
                    target: post
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





// Reactions on comment
// Love reaction on comment
module.exports.loveReactComment = async function(request, response){

    try {
        
        // fetch the comment
        let comment = await Comment.findById(request.params.id);

        // find if reaction already exists for that comment from current user
        let findLove = await Love.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, comment.id, "love", "comment");

        // if love already present then remove that like
        if(findLove){
            // removing that love from comment loves list
            await Comment.findByIdAndUpdate(comment.id, { $pull: {"loves": findLove.id}});

            await findLove.remove();

            comment = await Comment.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Love removed..",
                    reactAdded: "love",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    loveAdded: false,
                    user: request.user,
                    target: comment
                });
            }
        }
        // if love is not present then add one
        else{
            let love = await Love.create({
                user: request.user._id,
                target: comment._id,
                onModel: "Comment"
            });

            comment.loves.push(love);

            await comment.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Love added..",
                    reactAdded: "love",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    loveAdded: true,
                    user: request.user,
                    target: comment
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

// Haha reaction on comment
module.exports.hahaReactComment = async function(request, response){

    try {
        
        // fetch the comment
        let comment = await Comment.findById(request.params.id);

        // find if reaction already exists for that comment from current user
        let findHaha = await Haha.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, comment.id, "haha", "comment");

        // if haha already present then remove that like
        if(findHaha){
            // removing that haha from comment hahas list
            await Comment.findByIdAndUpdate(comment.id, { $pull: {"hahas": findHaha.id}});

            await findHaha.remove();

            comment = await Comment.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Haha removed..",
                    reactAdded: "haha",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    hahaAdded: false,
                    user: request.user,
                    target: comment
                });
            }
        }
        // if haha is not present then add one
        else{
            let haha = await Haha.create({
                user: request.user._id,
                target: comment._id,
                onModel: "Comment"
            });

            comment.hahas.push(haha);

            await comment.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Haha added..",
                    reactAdded: "haha",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    hahaAdded: true,
                    user: request.user,
                    target: comment
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

// Wow reaction on comment
module.exports.wowReactComment = async function(request, response){

    try {
        
        // fetch the comment
        let comment = await Comment.findById(request.params.id);

        // find if reaction already exists for that comment from current user
        let findWow = await Wow.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, comment.id, "wow", "comment");

        // if wow already present then remove that like
        if(findWow){
            // removing that wow from comments like list
            await Comment.findByIdAndUpdate(comment.id, { $pull: {"wows": findWow.id}});

            await findWow.remove();

            comment = await Comment.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Wow removed..",
                    reactAdded: "wow",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    wowAdded: false,
                    user: request.user,
                    target: comment
                });
            }
        }
        // if wow is not present then add one
        else{
            let wow = await Wow.create({
                user: request.user._id,
                target: comment._id,
                onModel: "Comment"
            });

            comment.wows.push(wow);

            await comment.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Wow added..",
                    reactAdded: "wow",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    wowAdded: true,
                    user: request.user,
                    target: comment
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

// Sad reaction on comment
module.exports.sadReactComment = async function(request, response){

    try {
        
        // fetch the comment
        let comment = await Comment.findById(request.params.id);

        // find if reaction already exists for that comment from current user
        let findSad = await Sad.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, comment.id, "sad", "comment");

        // if sad already present then remove that like
        if(findSad){
            // removing that sad from comments like list
            await Comment.findByIdAndUpdate(comment.id, { $pull: {"sads": findSad.id}});

            await findSad.remove();

            comment = await Comment.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Sad removed..",
                    reactAdded: "sad",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    sadAdded: false,
                    user: request.user,
                    target: comment
                });
            }
        }
        // if sad is not present then add one
        else{
            let sad = await Sad.create({
                user: request.user._id,
                target: comment._id,
                onModel: "Comment"
            });

            comment.sads.push(sad);

            await comment.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Sad added..",
                    reactAdded: "sad",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    sadAdded: true,
                    user: request.user,
                    target: comment
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

// Angry reaction on comment
module.exports.angryReactComment = async function(request, response){

    try {
        
        // fetch the comment
        let comment = await Comment.findById(request.params.id);

        // find if reaction already exists for that comment from current user
        let findAngry = await Angry.findOne({ target: request.params.id, user: request.user.id });

        // Remove any other previous reaction if present
        let reactionRemoved = await removePrevReaction(request, comment.id, "angry", "comment");

        // if angry already present then remove that like
        if(findAngry){
            // removing that angry from comments like list
            await Comment.findByIdAndUpdate(comment.id, { $pull: {"angrys": findAngry.id}});

            await findAngry.remove();

            comment = await Comment.findById(request.params.id);

            if(request.xhr){
                return response.status(200).json({
                    msg: "Angry removed..",
                    reactAdded: "angry",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    angryAdded: false,
                    user: request.user,
                    target: comment
                });
            }
        }
        // if angry is not present then add one
        else{
            let angry = await Angry.create({
                user: request.user._id,
                target: comment._id,
                onModel: "Comment"
            });

            comment.angrys.push(angry);

            await comment.save();

            if(request.xhr){
                return response.status(200).json({
                    msg: "Angry added..",
                    reactAdded: "angry",
                    reactionRemoved: reactionRemoved,
                    count: await getReactCount(comment),
                    angryAdded: true,
                    user: request.user,
                    target: comment
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

