const passport = require("passport");
const passportGoogle = require("passport-google-oauth").OAuth2Strategy;
const crypto = require("node:crypto");
const User = require("../models/user");

require("dotenv").config();

passport.use(new passportGoogle({
    clientID: process.env.G_CLIENT_ID,
    clientSecret: process.env.G_CLIENT_SECRET,
    callbackURL: process.env.G_CALLBACK_URL
}, function(accessToken, refreshToken, profile, done){

    User.findOne({ email: profile.emails[0].value }).exec(function(error, user){

        if(error){
            console.log(error);
            return done(error, false);
        }

        if(user){
            user.password = "";
            return done(null, user);
        }

        User.create({
            email: profile.emails[0].value,
            username: profile.displayName,
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