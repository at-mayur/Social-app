const mongoose = require("mongoose");


let likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Instead of a hardcoded model name in `ref`, `refPath` means Mongoose
    // will look at the `onModel` property to find the right model.
    target: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModel",
        required: true
    },
    onModel: {
        type: String,
        required: true,
        enum: ["Post", "Comment"]
    }
}, { timestamps: true });


const like = mongoose.model("Like", likeSchema);

module.exports = like;