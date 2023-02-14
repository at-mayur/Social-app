const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    commentContent: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
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
}, {timestamps: true});


const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;