const { response } = require("express");
const { request } = require("http");
const passport = require("passport");
const passportLocal = require("passport-local");

const User = require("../models/user");

// Setting passport to use our new Passport Local strategy
passport.use(new passportLocal.Strategy({
        // Options for local strategy
        // declaring our email field as username field
        usernameField: "email"
    },
    // Callback
    function(username, password, done){
        User.findOne({email: username}, function(error, user){
            if(error){
                console.log("Error fetching user from DB in passport");
                return done(error);
            }
            if(!user){
                // console.log("User not found");
                return done(null, false);
            }
            if(user.password!=password){
                // console.log("Invalid Password");
                return done(null, false);
            }
            return done(null, user);
        });
}));

// Serializing user i.e. telling passport to store only certain field of user data to cookie
passport.serializeUser(function(user, done){
    done(null, user._id);
});

// Deserialize user
// i.e. fetch all user details from user id that we have stored while serializing
passport.deserializeUser(function(id, done){
    User.findById(id, function(error, user){
        if(error){
            console.log("Error fetching user in passport");
            return done(error);
        }
        if(!user){
            console.log("User not found");
            return done(null, false);
        }
        return done(null, user);
    });
});

// Creating a middleware to check authentication
passport.checkAuthentication = function(request, response, next){

    // As it is middleware it will execute in between actual request call and controller function execution
    // And our flash messages will not be transferred to response
    // passing our flash msg from request to response
    if(response.locals.messages.success && response.locals.messages.success.length>0){
        request.flash('success', response.locals.messages.success);
    }
    if(response.locals.messages.error && response.locals.messages.error.length>0){
        request.flash('error', response.locals.messages.error);
    }

    if(request.isAuthenticated()){
        // if authenticated request then executing next step
        return next();
    }

    // if not authenticated request then back to sign in page
    return response.redirect("/sign-in");
};


// midlleware to pass authenticated user to response.locals
passport.setAuthenticatedUser = async function(request, response, next){

    try {
        
        // if request is authenticated then only pass user to response.locals
        if(request.isAuthenticated()){
            let user = await User.findById(request.user.id).populate("friends friendRequests requestSent", "username email profile");

            user.password = "";
            response.locals.user = user;
        }

        next();

    } catch (error) {
        console.log(error);
    }

};



module.exports = passport;