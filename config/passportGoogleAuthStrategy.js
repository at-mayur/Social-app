const passport = require("passport");
const passportGoogle = require("passport-google-oauth").OAuth2Strategy;
const crypto = require("node:crypto");
const User = require("../models/user");

require("dotenv").config();

// Setting passport to use Google Auth strategy
passport.use(new passportGoogle({
    // options for G-Auth Strategy
    // Needs to be created from google developer console
    clientID: process.env.G_CLIENT_ID,
    clientSecret: process.env.G_CLIENT_SECRET,
    // URL which will be called after successful authentication
    // Also needs to be set in google developer console
    callbackURL: process.env.G_CALLBACK_URL
}, function(accessToken, refreshToken, profile, done){

    // finding user with which user authenticated at google
    // Google will be providing some data about that user
    User.findOne({ email: profile.emails[0].value }).exec(function(error, user){

        if(error){
            console.log(error);
            return done(error, false);
        }

        // if user with that email already exist then authenticate with that user
        if(user){
            user.password = "";
            return done(null, user);
        }

        // If user does not exist then creating new one
        User.create({
            email: profile.emails[0].value,
            username: profile.displayName,
            // Setting random password using crypto
            password: crypto.randomBytes(20).toString('hex'),
            profile: profile.photos[0].value
        }, function(error, newUser){

            if(error){
                console.log(error);
                return;
            }

            return done(null, newUser);

        });

    });

}));



module.exports = passport;