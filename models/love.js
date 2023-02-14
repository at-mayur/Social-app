const mongoose = require("mongoose");

const loveReactSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModel",
        required: true
    },
    onModel: {
        type: String,
        enum: ["Post", "Comment"],
        required: true
    }
}, { timestamps: true });


const loveReact = mongoose.model("Love", loveReactSchema);


module.exports = loveReact;