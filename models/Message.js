const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint"
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    message: String,

    attachments: [String]

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
