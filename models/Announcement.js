const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    title: String,
    message: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);