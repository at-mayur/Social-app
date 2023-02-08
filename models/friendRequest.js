const mongoose = require("mongoose");


const friendRequestSchema = new mongoose.Schema({
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    sentTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

    // making timestamp true to store creation time
}, { timestamps: true });

const friendRequest = mongoose.model("FriendRequest", friendRequestSchema);

module.exports = friendRequest;