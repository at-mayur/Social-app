const Post = require("../models/post");
const Comment = require("../models/comment");


module.exports.postController = function(request, response){
    Post.find({}).populate('user').populate({
        path: 'comments',
        populate: {
            path: "user"
        }
    }).exec(function(error, posts){
        if(error){
            console.log(`Error fetching posts from DB..\n${error}`);
            return;
        }

        response.render("home",{
            title: "Home | Posts",
            posts: posts
        });
    });



    
    // Post.find({}).populate("user").exec(function(error, posts){
    //     if(error){
    //         console.log(`Error fetching posts from Db..\n${error}`);
    //         return;
    //     }

    //     response.render("home",{
    //         title: "Home | Posts",
    //         posts: posts
    //     });
    // });
};

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
            user: request.user._id
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