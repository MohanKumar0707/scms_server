const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");
const ComplaintHistory = require("../../models/ComplaintHistory");
const User = require("../../models/User");

// ----------------------------------------------------------------------------------------------

router.get("/my-complaints/:registerNo", async (req, res) => {

    try {
        
        const user = await User.findOne({ registerNo: req.params.registerNo });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Fetch complaints
        const complaints = await Complaint.find({ student: user._id })
            .populate("category", "name")
            .populate("department", "name")
            .populate("assignedTo", "name")
            .sort({ createdAt: -1 });

        // Fetch history for all complaints
        const complaintIds = complaints.map(c => c._id);
        const histories = await ComplaintHistory.find({ complaint: { $in: complaintIds } })
            .populate("updatedBy", "name role")
            .sort({ createdAt: 1 });

        // Group histories by complaint ID
        const historyMap = {};
        histories.forEach(history => {
            const complaintId = history.complaint.toString();
            if (!historyMap[complaintId]) {
                historyMap[complaintId] = [];
            }
            historyMap[complaintId].push(history);
        });

        // Combine complaints with their histories
        const complaintsWithHistory = complaints.map(complaint => ({
            ...complaint.toObject(),
            history: historyMap[complaint._id.toString()] || []
        }));

        res.json(complaintsWithHistory);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;