const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    registerNo: {
        type: String,
        required: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    phone: { type: String },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["student", "staff", "admin"],
        required: true
    },

    department: {
        type: String,
        required: true
    },

    semester: { type: String },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);