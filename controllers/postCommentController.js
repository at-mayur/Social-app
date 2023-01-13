const Post = require("../models/post");
const Comment = require("../models/comment");


module.exports.createPostController = function(request, response){
    Post.create({
        postContent: request.body.postContent,
        user: request.user._id
    }, function(error, post){
        if(error){
            console.log(`Error adding post to DB..\n${error}`);
            return;
        }

        // console.log(post);
        response.redirect("back");
    });
};

module.exports.createCommentController = function(request, response){
    Post.findById(request.body.post, function(error, post){
        if(error){
            console.log(`Error fetching post from DB..\n${error}`);
            return;
        }

        Comment.create({
            commentContent: request.body.commentContent,
            user: request.user._id,
            post: post._id
        }, function(error, comment){
            if(error){
                console.log(`Error adding Comment to DB..\n${error}`);
                return;
            }

            post.comments.push(comment._id);
            post.save();
            // console.log(post, comment);
            return response.redirect("back");
        });
    });
};

module.exports.deletePostController = function(request, response){
    // console.log(request.params);
    Post.findById(request.params.id, function(error, post){
        if(error){
            console.log(`Error finding post from db..\n${error}`);
            return;
        }
        if(request.user && request.user.id==post.user){
            post.remove();

            Comment.deleteMany({post: request.params.id}, function(error){
                if(error){
                    console.log(`Error deleting comments on that post..\n${error}`);
                    return;
                }
            });
        }
    });
    return response.redirect("back");
};

module.exports.deleteCommentController = function(request, response){
    Comment.findById(request.params.id).populate("user post").exec(function(error, comment){
        if(error){
            console.log(`Error fetching Comment from DB..\n${error}`);
            return;
        }

        if(request.user && (request.user.id==comment.user.id || request.user.id==comment.post.user)){
            Post.findByIdAndUpdate(comment.post.id, { $pull: {'comments': comment.id}}, function(error, post){
                if(error){
                    console.log(`Error deleting comment from post Array..\n${error}`);
                    return;
                }

                // console.log(post);
            });

            comment.remove();
        }
    });

    return response.redirect("back");
};