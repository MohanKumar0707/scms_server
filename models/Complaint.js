const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

	complaintNo: {
		type: String,
		unique: true
	},

	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
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
		enum: ["Pending", "Assigned", "In Progress", "Resolved", "Closed", "Rejected"],
		default: "Pending"
	},

	priority: {
		type: String,
		enum: ["Low", "Medium", "High", "Emergency"],
		default: "Medium"
	},

	assignedTo: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},

	resolvedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
