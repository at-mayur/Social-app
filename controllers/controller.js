const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");
const Like = require("../models/like");
const Friendship = require("../models/friendship");
const FriendRequest = require("../models/friendRequest");
const Chat = require("../models/chat");
const Message = require("../models/message");

// Reaction models
const Love = require("../models/love");
const Haha = require("../models/haha");
const Wow = require("../models/wow");
const Sad = require("../models/sad");
const Angry = require("../models/angry");

const fs = require("fs");
const path = require("path");

// Controller for displaying Home page
async function homeController(request, response){

    try {

        // Fetching all posts and sorting in descending order of their creation time
        let posts = await Post.find({}).sort('-createdAt')
        // populating users with username and email
        .populate('user', "username email")
        // populating comments with desc sort w.r.t. creation time and also popualating user for comment
        .populate({
            path: 'comments',
            options: { sort: '-createdAt' },
            // Using multiple path population
            populate: [{
                path: "user",
                select: "_id username email"
            },
            // Second path to populate reactions on comments with desc sort then again populating users for that reactions
            {
                path: "likes loves hahas wows sads angrys",
                options: { sort: "-createdAt" },
                populate: {
                    path: "user",
                    select: "username profile"
                }
            }]
        })
        // Populating reactions for post with desc sort then again populating users for that reactions
        .populate({
            path: "likes loves hahas wows sads angrys",
            options: { sort: "-createdAt" },
            populate: {
                path: "user",
                select: "username profile"
            }
        });


        for(let post of posts){
            // finding if current user liked this post
            let reaction = await getReaction(request, post.id);
            post.reaction = reaction;


            post.reactCount = post.likes.length + post.loves.length + post.hahas.length
                                + post.wows.length + post.sads.length + post.angrys.length;


            // finding if user has liked any comment on this post
            for(let comment of post.comments){
                let cmtReaction = await getReaction(request, comment.id);
                comment.reaction = cmtReaction;

                comment.reactCount = comment.likes.length + comment.loves.length + comment.hahas.length
                                + comment.wows.length + comment.sads.length + comment.angrys.length;
            }

        }


        // Fetching all users
        // for maintaining users list which are not friends of current user
        let users = await User.find({});


        for(let i=0 ; i<users.length ; i++){

            // if user is current user then drop that user from list
            if(users[i].id==request.user.id){
                users.splice(i, 1);
                i--;
                continue;
            }
            
            // finding if current user is already friend with this user
            let fr1 = await Friendship.findOne({ requestAccepted: request.user.id, requestSent: users[i].id });
            let fr2 = await Friendship.findOne({ requestAccepted: users[i].id, requestSent: request.user.id });

            // finding if current user has/sent request from/to this user
            let req1 = await FriendRequest.findOne({ sentBy: request.user.id, sentTo: users[i].id });
            let req2 = await FriendRequest.findOne({ sentBy: users[i].id, sentTo: request.user.id });
            
            // dropping that user from list if any one of the above conditions is true
            if(fr1 || fr2 || req1 || req2){
                users.splice(i, 1);
                i--;
            }
            
        }

        // finding all chats for current user and populating users with selective fields
        // sorting desc order according creation time i.e. latest one at top
        let chats = await Chat.find({ $or: [ { user1: request.user.id }, { user2: request.user.id } ] })
        .populate("user1 user2", "id username email profile").sort("-createdAt");

        return response.render("home",{
            title: "Home | Posts",
            posts: posts,
            users: users,
            chats: chats
        });


    } catch (error) {
        console.log(`Error fetching posts..\n${error}`);
    }
    
    
}




// Functions to get reaction on post or comment
async function getReaction(request, targetId){

    try {
        // Set default value for reaction none
        let reaction = "none";
        
        // Get reaction from DB
        let likeFound = await Like.findOne({ user: request.user.id, target: targetId });
        let loveFound = await Love.findOne({ user: request.user.id, target: targetId });
        let hahaFound = await Haha.findOne({ user: request.user.id, target: targetId });
        let wowFound = await Wow.findOne({ user: request.user.id, target: targetId });
        let sadFound = await Sad.findOne({ user: request.user.id, target: targetId });
        let angryFound = await Angry.findOne({ user: request.user.id, target: targetId });

        // if any of reaction exists then update reaction value
        if(likeFound){
            reaction = "like";
        }
        else if(loveFound){
            reaction = "love";
        }
        else if(hahaFound){
            reaction = "haha";
        }
        else if(wowFound){
            reaction = "wow";
        }
        else if(sadFound){
            reaction = "sad";
        }
        else if(angryFound){
            reaction = "angry";
        }


        return reaction;

    } catch (error) {
        console.log(error);
    }

}




// controller for fetching profile
async function profileController(request, response){
    try{
        // Fetching user whose profile has requested
        let profUser = await User.findById(request.params.id);
        // Setting password field not to pass it to client side
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

// controller for updating profile details
async function profileUpdateController(request, response){

    try {

        let updateUser = request.body;

        // Executing update only if requesting user and profile user is same
        if(request.user.id==updateUser.userId){

            if(request.user.email!=updateUser.email){

                // if user has changed email then check if user with updated email already exists
                let user = await User.findOne({email: updateUser.email});

                // user with given mailId already exist then do not update
                if(user){
                    console.log("User already exist with given Emailid. Select another one.");
                    request.flash('info', 'User already exist with given Emailid.');
                    return response.redirect("back");
                }
    
                // fetching user
                let userWithID = await User.findById(updateUser.userId);
                // updating details
                userWithID.username = updateUser.username;
                userWithID.email = updateUser.email;

                // if request contains file then update profile field
                if(request.file){
                    // delete previous file for profile if exists
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

// controller for signing up
function signUpController(request, response){
    // if user already logged in then cannot access sign up
    if(request.isAuthenticated()){
        request.flash('info', 'Already logged in..');
        return response.redirect("/");
    }
    return response.render("signup", {
        title: "User | Sign Up"
    });
}

function signInController(request, response){
    // if user already logged in then cannot access sign in
    if(request.isAuthenticated()){
        request.flash('info', 'Already logged in..');
        return response.redirect("/");
    }
    return response.render("signin", {
        title: "User | Sign In"
    });
}

// if user is authenticated then redirect to home page
function createSession(request, response){
    request.flash('success', 'Log In Successful..');
    return response.redirect("/");
}

// controller for log out action
function removeSession(request, response){
    // function provided by passport
    // clears session cookie and logs out
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

// controller for creating new user
async function createUser(request, response){
    try {
        // Fetch user with given email id
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

// controller for accepting friend request
async function acceptRequest(request, response){

    try {
        // fetch user from whom request came
        let user = await User.findById(request.params.id);

        if(!user){
            if(request.xhr){
                return response.status(400).json({
                    msg: "User not found"
                });
            }
            
        }

        // Create friendship for current user and request sent user
        await Friendship.create({
            requestAccepted: request.user.id,
            requestSent: request.params.id
        });

        // add that user to users friend list and remove that user from user's friend request list
        await User.findByIdAndUpdate(request.user.id, { $pull: { 'friendRequests': request.params.id },
                                                        $push: { 'friends': request.params.id } });

        // remove current user from that user's request sent list
        let index = user.requestSent.findIndex((objId) => { return objId==request.user.id });

        if(index!=-1){
            user.requestSent.splice(index, 1);
        }

        // add current user to that user's friend list
        user.friends.push(request.user.id);

        await user.save();

        // delete friend request after acceptance
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

// controller for sending friend request
async function addFriend(request, response){

    try {
        // fetch user to whom request has to be sent
        let user = await User.findById(request.params.id);

        if(!user){
            if(request.xhr){
                return response.status(400).json({
                    msg: "User not found"
                });
            }

            return response.redirect("back");
            
        }

        // create friend request
        await FriendRequest.create({
            sentBy: request.user.id,
            sentTo: request.params.id
        });

        // add that user to current user's request sent list
        await User.findByIdAndUpdate(request.user.id, { $push: { 'requestSent': request.params.id }});

        // add current user to that user's friend request list
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

// controller for opening chat
async function openChat(request, response){
    try {

        // fetch user to whom msg has to be sent
        let userId = await User.findById(request.params.id);

        // Fetch chat if already exists between these 2 users
        let chat1 = await Chat.findOne({ user1: userId.id, user2: request.user.id })
        .populate("user1 user2", "id username email profile")
        // populating messages for that chat with sort in ascending order of time of creation
        .populate({
            path: "chatMessages",
            options: { sort: "createdAt" }
        });
        let chat2 = await Chat.findOne({ user2: userId.id, user1: request.user.id })
        .populate("user1 user2", "id username email profile")
        .populate({
            path: "chatMessages",
            options: { sort: "createdAt" }
        });

        // If chat already exists then return chat and current user
        if(chat1){
            if(request.xhr){
                return response.status(200).json({
                    msg: "Chat found..!!",
                    chat: chat1,
                    currUser: request.user
                });
            }

            return response.redirect("back");
        }

        if(chat2){
            if(request.xhr){
                return response.status(200).json({
                    msg: "Chat found..!!",
                    chat: chat2,
                    currUser: request.user
                });
            }

            return response.redirect("back");
        }

        // If chat not present then find if these 2 users are friend
        let fr1 = await Friendship.findOne({ requestAccepted: request.user.id, requestSent: userId });
        let fr2 = await Friendship.findOne({ requestAccepted: userId, requestSent: request.user.id });

        // if they are friend then create chat for them
        if(fr1 || fr2){
            let chat = await Chat.create({
                user1: request.user.id,
                user2: userId
            });

            await chat.populate("user1 user2", "email username profile");

            if(request.xhr){
                return response.status(200).json({
                    msg: "Chat found..!!",
                    chat: chat,
                    currUser: request.user
                });
            }

            return response.redirect("back");
        }


        // If they are not friend then do nothing
        if(request.xhr){
            return response.status(400).json({
                msg: "You cannot Chat with this user..!!"
            });
        }

        return response.redirect("back");

        
    } catch (error) {
        console.log(error);
        if(request.xhr){
            return response.status(500).json({
                msg: "Internal Server Error",
                error: error
            });
        }

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
    addFriend: addFriend,
    openChat: openChat
};