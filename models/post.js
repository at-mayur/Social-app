const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({
    postContent: {
        type: String,
        required: true
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


const Post = mongoose.model("Post", postSchema);

module.exports = Post;