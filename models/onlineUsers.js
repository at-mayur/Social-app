const mongoose = require("mongoose");

const onlineUsersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    socketId: {
        type: String,
        required: true
    }
}, { timestamps: true });

const onlineUser = mongoose.model("OnlineUsers", onlineUsersSchema);

module.exports = onlineUser;