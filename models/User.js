const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    
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

    phone: {
        type: String
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["student", "staff", "admin"],
        required: true
    },

    // Student-specific fields
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },

    department: {
        type: String,
        required: true
    },

    course: { type: String },

    yearOrSemester: { type: String },

    status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);