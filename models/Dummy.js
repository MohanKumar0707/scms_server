const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: String
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);

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

const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    complaintId: {
        type: String,
        unique: true,
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },

    title: String,
    description: String,

    status: {
        type: String,
        enum: ["Pending", "Assigned","Rejected", "In Progress", "Resolved", ],
        default: "Pending"
    },

    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Emergency"],
        default: "Medium"
    },

    attachments: [String],

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    resolvedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);


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