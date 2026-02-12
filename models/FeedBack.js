const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint"
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rating: { type: Number, min: 1, max: 5 },
    comment: String
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
