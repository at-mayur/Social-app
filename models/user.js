const mongoose = require("mongoose");

const multer = require("multer");
const path = require("path");

const PROFILE_PIC_PATH = "/upload/profile/";

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: String
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    friendRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    requestSent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

    // making timestamp true to store creation time
}, {timestamps: true});


let storage = multer.diskStorage({
    destination: function(request, file, callBack){
        callBack(null, path.join(__dirname, "../", PROFILE_PIC_PATH));
    },
    filename: function(request, file, callBack){
        callBack(null, file.fieldname + Date.now());
    }
});

userSchema.statics.uploadProfile = multer({ storage: storage }).single("profile");
userSchema.statics.profilePicPath = PROFILE_PIC_PATH;

const User = mongoose.model("User", userSchema);

module.exports = User;