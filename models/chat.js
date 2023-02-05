const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    chatMessages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
}, { timestamps: true });


const chat = mongoose.model("Chat", chatSchema);

module.exports = chat;