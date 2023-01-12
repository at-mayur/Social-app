const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    commentContent: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});


const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;