const User = require("../models/user");

function homeController(request, response){
    let userId = request.signedCookies.currUser;
    if(userId){
        User.findById(userId, function(error, user){
            if(error){
                console.log(`Sorry, Error fetching user..\n${error}`);
                return response.redirect("back");
            }
            if(user){
                return response.render("home", {
                    user: user
                });
            }
            
        });
    }
    else{
        return response.render("home");
    }
}

function profileController(request, response){
    let userId = request.signedCookies.currUser;
    if(userId){
        User.findById(userId, function(error, user){
            if(error){
                console.log(`Sorry, Error fetching user..\n${error}`);
                return response.redirect("back");
            }
            if(user){
                response.cookie("currUser", userId,{
                    maxAge: 1*60*1000,
                    signed: true
                });
                return response.render("profile", {
                    user: user
                });
            }
            
        });
    }
    else{
        return response.redirect("/sign-in");
    }
    
}

function signUpController(request, response){
    if(request.signedCookies.currUser){
        return response.redirect("/profile");
    }
    return response.render("signup");
}

function signInController(request, response){
    if(request.signedCookies.currUser){
        return response.redirect("/profile");
    }
    return response.render("signin");
}

function signOutController(request, response){
    let userId = request.signedCookies.currUser;
    if(userId){
        response.clearCookie("currUser");
    }
    return response.redirect("/");
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
            response.cookie("currUser", user._id,{
                maxAge: 1*60*1000,
                signed: true
            });
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
    signOutController: signOutController,
    createUser: createUser,
    createSession: createSession
};