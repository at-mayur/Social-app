const passport = require("passport");
const passportJWT = require("passport-jwt").Strategy;
const extractStrategy = require("passport-jwt").ExtractJwt;
const User = require("../models/user");

require("dotenv").config();


let opts = {
    jwtFromRequest: extractStrategy.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};


passport.use(new passportJWT(opts, function(jwtPayload, done){

    User.findById(jwtPayload.id, function(error, user){
        if(error){
            console.log(error);
            return done(error, false);
        }

        if(user){
            user.password = "";
            return done(null, user);
        }
        else{
            return done(null, false);
        }
    });

}));


module.exports = passport;