const mongoose = require("mongoose");

const angryReactSchema = new mongoose.Schema({
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


const angryReact = mongoose.model("Angry", angryReactSchema);


module.exports = angryReact;