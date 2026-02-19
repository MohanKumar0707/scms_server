const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Complaint = require("../../models/Complaint");

// GET complaints assigned to a staff (by registerNo)
router.get("/:registerNo", async (req, res) => {
  try {
    const { registerNo } = req.params;

    // find staff user
    const staff = await User.findOne({ registerNo, role: "staff" });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // find complaints assigned to this staff
    const complaints = await Complaint.find({ assignedTo: staff._id })
      .populate("student", "name registerNo")
      .populate("category", "name")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
