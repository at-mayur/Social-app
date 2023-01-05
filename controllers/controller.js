const User = require("../models/user");

function homeController(request, response){
    return response.render("home");
}

function profileController(request, response){
    return response.render("profile");
}

function signUpController(request, response){
    return response.render("signup");
}

function signInController(request, response){
    return response.render("signin");
}

function createUser(request, response){
    User.findOne({email: request.body.email}, function(error, user){
        if(error){
            console.log(`Sorry, Error fetching user..\n${error}`);
            return;
        }
        if(user){
            console.log(`User with given mail Id already exists..`);
            return;
        }
        if(request.body.password!=request.body.confirmPassword){
            console.log(`Password and Confirm Password does not match.\nTry again...`);
            return;
        }
        let newUser = new User(request.body);
        newUser.save(function(error){
            if(error){
                alert("Error adding user to DB..");
                console.log(`Error add user to Db\n${error}`);
            }
        });
        
    });
    return response.redirect("/sign-in");
}

function createSession(request, response){
    // console.log(request.body);
    let gotLogin = false;
    User.findOne({email: request.body.email}, function(error, user){
        if(error){
            console.log(`Sorry, Error fetching user..\n${error}`);
            return response.redirect("back");
        }
        if(!user){
            console.log(`User does not exist..`);
            return response.redirect("back");
        }
        if(user.password==request.body.password){
            // console.log(user);
            response.cookie.currUser = user._id;
            gotLogin = true;
            return response.redirect("/profile");
        }
        
        console.log("Invalid Password..");
        return response.redirect("back");
        
    });
    
}


module.exports = {
    homeController: homeController,
    profileController: profileController,
    signUpController: signUpController,
    signInController: signInController,
    createUser: createUser,
    createSession: createSession
};