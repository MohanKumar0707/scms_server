const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");

// ----------------------------------------------------------------------------------------------

// GET all complaints

router.get("/", async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("category", "name")
            .populate("department", "name")
            .populate("student", "name")
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch complaints" });
    }
});

// ----------------------------------------------------------------------------------------------

// GET single complaint by ID

router.get("/:id", async (req, res) => {

    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate("category", "name")
            .populate("department", "name")
            .populate("student", "name registerNo email phone")
            .populate("assignedTo", "name email");

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch complaint" });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;