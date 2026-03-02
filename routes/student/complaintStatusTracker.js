const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");

// GET /api/complaintStatus/:id?registerNo=...
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { registerNo } = req.query;

        // Find complaint and populate student details to verify ownership
        const complaint = await Complaint.findOne({ complaintId: id })
            .populate("student", "registerNo name")
            .populate("category", "name")
            .populate("department", "name");

        if (!complaint) {
            return res.status(404).json({ message: "Complaint ID not found." });
        }

        // Security Check: Does the registerNo match the creator?
        if (complaint.student.registerNo !== registerNo) {
            return res.status(403).json({ message: "Access denied. You can only track your own complaints." });
        }

        res.status(200).json(complaint);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;