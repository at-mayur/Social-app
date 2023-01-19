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
                console.log("User not found");
                return done(null, false);
            }
            if(user.password!=password){
                console.log("Invalid Password");
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

    request.flash('success', response.locals.messages.success);
    request.flash('success', response.locals.messages.error);
    return response.redirect("/sign-in");
};

passport.setAuthenticatedUser = function(request, response, next){
    if(request.isAuthenticated()){
        response.locals.user = request.user;
    }

    next();
};



module.exports = passport;