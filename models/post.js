const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const POST_IMAGE_PATH = "/upload/posts/";

const postSchema = new mongoose.Schema({
    postContent: {
        type: String,
        required: true
    },
    postImage: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Like"
        }
    ],
    loves: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Love"
        }
    ],
    hahas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Haha"
        }
    ],
    wows: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wow"
        }
    ],
    sads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sad"
        }
    ],
    angrys: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Angry"
        }
    ]

    // making timestamp true to store creation time
}, {
    timestamps: true
});

// Declaring multer storage
let storage = multer.diskStorage({
    destination: function(request, file, callBack){
        callBack(null, path.join(__dirname, "../", POST_IMAGE_PATH));
    },
    // Using path.extname() to extract extension from original file name
    filename: function(request, file, callBack){
        callBack(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }
});

// Declaring static functions and variable with post schema. Accessible by model name.
postSchema.statics.uploadImage = multer({ storage: storage }).single("post_img");
postSchema.statics.postImagePath = POST_IMAGE_PATH;


const Post = mongoose.model("Post", postSchema);

module.exports = Post;