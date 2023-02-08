const mongoose = require("mongoose");

const friendShipSchema = new mongoose.Schema({
    requestSent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    requestAccepted: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

    // making timestamp true to store creation time
}, { timestamps: true });


const friendship = mongoose.model("Freiendship", friendShipSchema);

module.exports = friendship;