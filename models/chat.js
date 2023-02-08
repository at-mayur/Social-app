const mongoose = require("mongoose");

// creating new schema
const chatSchema = new mongoose.Schema({
    // declaring type as objectId and references User model
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
    // declaring type as objectId and references Message model
    chatMessages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
    // making timestamp true to store creation time
}, { timestamps: true });

// creating model from schema
const chat = mongoose.model("Chat", chatSchema);

module.exports = chat;