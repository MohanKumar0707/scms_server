const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");
const User = require("../../models/User");

// ----------------------------------------------------------------------------------------------

router.get("/my-complaints/:registerNo", async (req, res) => {

    try {

        const user = await User.findOne({ registerNo: req.params.registerNo });
        if (!user) return res.status(404).json({ message: "User not found" });

        const complaints = await Complaint.find({ student: user._id })
            .populate("category", "name")
            .populate("department", "name")
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;