const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint"
    },
    action: String, // Assigned / Resolved / Reopened
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("History", historySchema);
