const mongoose = require("mongoose");

const hahaReactSchema = new mongoose.Schema({
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


const hahaReact = mongoose.model("Haha", hahaReactSchema);


module.exports = hahaReact;