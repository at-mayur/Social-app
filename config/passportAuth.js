const { response } = require("express");
const { request } = require("http");
const passport = require("passport");
const passportLocal = require("passport-local");

const User = require("../models/user");

passport.use(new passportLocal.Strategy({
        // declaring our email field as username field
        usernameField: "email"
    },
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


passport.checkAuthentication = function(request, response, next){
    if(request.isAuthenticated()){
        // console.log("request", request.flash("success"), request.flash("success"));
        // console.log("response", response.locals.messages.success, response.locals.messages.error);
        return next();
    }

    if(response.locals.messages.success && response.locals.messages.success.length>0){
        // console.log(response.locals.messages.success);
        request.flash('success', response.locals.messages.success);
    }
    if(response.locals.messages.error && response.locals.messages.error.length>0){
        request.flash('error', response.locals.messages.error);
    }
    
    return response.redirect("/sign-in");
};

passport.setAuthenticatedUser = async function(request, response, next){
    if(request.isAuthenticated()){
        await User.findById(request.user.id).populate("friends friendRequests requestSent", "_id username email profile").exec(function(error, user){
            if(error){
                console.log(error);
                return;
            }

            user.password = "";
            // console.log(user);
            response.locals.user = user;
        });
    }

    next();
};



module.exports = passport;