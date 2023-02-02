const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");
const Like = require("../models/like");
const Friendship = require("../models/friendship");
const FriendRequest = require("../models/friendRequest");
const fs = require("fs");
const path = require("path");

async function homeController(request, response){

    try {

        let posts = await Post.find({}).sort('-createdAt')
        .populate('user', "username email").populate({
            path: 'comments',
            options: { sort: '-createdAt' },
            populate: {
                path: "user",
                select: "_id username email"
            }
        });


        for(let post of posts){
            let likeFound = await Like.findOne({ user: request.user.id, target: post.id });

            if(likeFound){
                post.like = true;
            }
            else{
                post.like = false;
            }

            for(let comment of post.comments){
                let likeFound = await Like.findOne({ user: request.user.id, target: comment.id });

                if(likeFound){
                    comment.like = true;
                }
                else{
                    comment.like = false;
                }
            }

        }


        let users = await User.find({});


        for(let i=0 ; i<users.length ; i++){

            
            if(users[i].id==request.user.id){
                users.splice(i, 1);
                i--;
                continue;
            }
            
            let fr1 = await Friendship.findOne({ requestAccepted: request.user.id, requestSent: users[i].id });
            let fr2 = await Friendship.findOne({ requestAccepted: users[i].id, requestSent: request.user.id });
            let req1 = await FriendRequest.findOne({ sentBy: request.user.id, sentTo: users[i].id });
            let req2 = await FriendRequest.findOne({ sentBy: users[i].id, sentTo: request.user.id });
            
            if(fr1 || fr2 || req1 || req2){
                users.splice(i, 1);
                i--;
            }
            
        }
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
        profUser.password = "";
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

                let user = await User.findOne({email: updateUser.email});

                if(user){
                    console.log("User already exist with given Emailid. Select another one.");
                    request.flash('info', 'User already exist with given Emailid.');
                    return response.redirect("back");
                }
    
                let userWithID = await User.findById(updateUser.userId);
                userWithID.username = updateUser.username;
                userWithID.email = updateUser.email;

                if(request.file){
                    if(userWithID.profile){
                        if(fs.existsSync(path.join(__dirname, ".."+userWithID.profile))){
                            fs.unlinkSync(path.join(__dirname, ".."+userWithID.profile));
                        }
                    }
                    userWithID.profile = User.profilePicPath + request.file.filename;
                }

                await userWithID.save();
                
            }
            else{

                let userWithID = await User.findById(updateUser.userId);
                userWithID.username = updateUser.username;

                if(request.file){
                    if(userWithID.profile){
                        if(fs.existsSync(path.join(__dirname, ".."+userWithID.profile))){
                            fs.unlinkSync(path.join(__dirname, ".."+userWithID.profile));
                        }
                    }
                    userWithID.profile = User.profilePicPath + request.file.filename;
                }

                await userWithID.save();
                
            }
        }

        request.flash("success", "User Details Updated Successfully");
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

async function acceptRequest(request, response){

    try {
        let user = await User.findById(request.params.id);

        if(!user){
            if(request.xhr){
                return response.status(400).json({
                    msg: "User not found"
                });
            }
            
        }

        await Friendship.create({
            requestAccepted: request.user.id,
            requestSent: request.params.id
        });

        await User.findByIdAndUpdate(request.user.id, { $pull: { 'friendRequests': request.params.id },
                                                        $push: { 'friends': request.params.id } });

        let index = user.requestSent.findIndex((objId) => { return objId==request.user.id });

        if(index!=-1){
            user.requestSent.splice(index, 1);
        }

        user.friends.push(request.user.id);

        await user.save();

        await FriendRequest.deleteOne({ sentBy:request.params.id, sentTo: request.user.id });

        if(request.xhr){
            return response.status(200).json({
                msg: "Friend added successfully"
            });
        }

        return response.redirect("back");


    } catch (error) {
        if(request.xhr){
            return response.status(500).json({
                msg: "Error occured while accepting request"
            });
        }
        
        console.log("Error adding friendship", error);
        return response.redirect("back");
    }

}


async function addFriend(request, response){

    try {
        let user = await User.findById(request.params.id);

        if(!user){
            if(request.xhr){
                return response.status(400).json({
                    msg: "User not found"
                });
            }

            return response.redirect("back");
            
        }

        await FriendRequest.create({
            sentBy: request.user.id,
            sentTo: request.params.id
        });

        await User.findByIdAndUpdate(request.user.id, { $push: { 'requestSent': request.params.id }});

        user.friendRequests.push(request.user.id);

        user.save();

        if(request.xhr){
            return response.status(200).json({
                msg: "Friend Request sent successfully"
            });
        }

        return response.redirect("back");


    } catch (error) {
        if(request.xhr){
            return response.status(500).json({
                msg: "Error occured while sending request"
            });
        }
        
        console.log("Error adding friendship", error);
        return response.redirect("back");
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
    profileUpdateController: profileUpdateController,
    acceptRequest: acceptRequest,
    addFriend: addFriend
};