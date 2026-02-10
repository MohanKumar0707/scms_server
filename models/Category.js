const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Emergency"],
        default: "Medium"
    }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);