const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Complaint = require("../../models/Complaint");

// ----------------------------------------------------------------------------------------------

// GET complaints assigned to a staff (by registerNo)

router.get("/:registerNo", async (req, res) => {

    try {

        const { registerNo } = req.params;

        const staff = await User.findOne({ registerNo, role: "staff" });
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        const complaints = await Complaint.find({ assignedTo: staff._id })
            .populate("student", "name registerNo")
            .populate("category", "name")
            .populate("department", "name").sort({ createdAt: -1 });

            console.log(complaints)

        res.json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;