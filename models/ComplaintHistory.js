const mongoose = require("mongoose");

const complaintHistorySchema = new mongoose.Schema({

    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
        required: true
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Assigned", "In Progress", "Resolved", "Closed", "Rejected"]
    },

    title: String,
    description: String,
    photos: [String],
    charges: Number

}, { timestamps: true });

module.exports = mongoose.model("ComplaintHistory", complaintHistorySchema);