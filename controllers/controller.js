const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

async function homeController(request, response){

    try {

        let posts = await Post.find({}).populate('user').populate({
            path: 'comments',
            populate: {
                path: "user post"
            }
        });

        let users = await User.find({});
        return response.render("home",{
            title: "Home | Posts",
            posts: posts,
            users: users
        });


    } catch (error) {
        console.log(`Error fetching posts..\n${error}`);
    }
    
    
}

async function profileController(request, response){
    // console.log(request.params.id);
    try{
        let profUser = await User.findById(request.params.id);
        return response.render("profile", {
            title: "User | Profile",
            profUser: profUser
        });


    } catch(error){
        request.flash('error', error);
        console.log(`Error getting user from DB..\n${error}`);
    }
    
    
}

async function profileUpdateController(request, response){

    try {

        let updateUser = request.body;
        if(request.user.id==updateUser.userId){
            if(request.user.email!=updateUser.email){
    
                await User.findByIdAndUpdate(updateUser.userId, {username: updateUser.username, email: updateUser.email});
                
            }
            else{

                await User.findByIdAndUpdate(updateUser.userId, {username: updateUser.username});
                
            }
        }

        request.flash('success', 'User details updated Successfully..');
        return response.redirect("back");
        
    } catch (error) {
        console.log(`Error updating user data..\n${error}`);
    }
    

}

function signUpController(request, response){
    if(request.isAuthenticated()){
        request.flash('info', 'Already logged in..');
        return response.redirect("/");
    }
    return response.render("signup", {
        title: "User | Sign Up"
    });
}

function signInController(request, response){
    if(request.isAuthenticated()){
        request.flash('info', 'Already logged in..');
        return response.redirect("/");
    }
    return response.render("signin", {
        title: "User | Sign In"
    });
}

function createSession(request, response){
    request.flash('success', 'Log In Successful..');
    return response.redirect("/");
}

function removeSession(request, response){
    request.logout(function(error){
        if(error){
            console.log("Error signing off\n", error);
            request.flash('error', error);
            return;
        }

        request.flash('success', 'Logged out successfully..');
        return response.redirect("/");
    });
}

async function createUser(request, response){
    try {
        let user = await User.findOne({email: request.body.email});

        if(user){
            console.log(`User with given mail Id already exists..`);
            return;
        }
        if(request.body.password!=request.body.confirmPassword){
            console.log(`Password and Confirm Password does not match.\nTry again...`);
            return;
        }

        let newUser = new User(request.body);
        await newUser.save();

        request.flash('success', 'User Created Successfully...');
        return response.redirect("/sign-in");


    } catch (error) {
        console.log(`Sorry, Error fetching user..\n${error}`);
    }
    
}

module.exports = {
    homeController: homeController,
    profileController: profileController,
    signUpController: signUpController,
    signInController: signInController,
    createSession: createSession,
    removeSession: removeSession,
    createUser: createUser, 
    profileUpdateController: profileUpdateController
};