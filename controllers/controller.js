const Post = require("../models/post");
const Comment = require("../models/comment");

function homeController(request, response){
    Post.find({}).populate('user').populate({
        path: 'comments',
        populate: {
            path: "user post"
        }
    }).exec(function(error, posts){
        if(error){
            console.log(`Error fetching posts from DB..\n${error}`);
            return;
        }

        return response.render("home",{
            title: "Home | Posts",
            posts: posts
        });
    });

}

function profileController(request, response){
    return response.render("profile", {
        title: "User | Profile"
    });
}

function signUpController(request, response){
    if(request.isAuthenticated()){
        return response.redirect("/");
    }
    return response.render("signup", {
        title: "User | Sign Up"
    });
}

function signInController(request, response){
    if(request.isAuthenticated()){
        return response.redirect("/");
    }
    return response.render("signin", {
        title: "User | Sign In"
    });
}

function createSession(request, response){
    return response.redirect("/");
}

function removeSession(request, response){
    request.logout(function(error){
        if(error){
            console.log("Error signing off\n", error);
            return;
        }
    });

    return response.redirect("/");
}

module.exports = {
    homeController: homeController,
    profileController: profileController,
    signUpController: signUpController,
    signInController: signInController,
    createSession: createSession,
    removeSession: removeSession
};