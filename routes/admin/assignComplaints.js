const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Complaint = require("../../models/Complaint");


// Express route example
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find({status: "Pending"})
      .populate('student', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get only staff users
router.get("/staff", async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" }).select("_id name department");
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});


// routes/adminComplaints.js
router.patch("/:id/assign", async (req, res) => {
  try {
    const { staffId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: staffId,
        status: "In Progress"
      },
      { new: true }
    ).populate("assignedTo", "name department");

    res.json(complaint);
  } catch (err) {
    console.error("Staff assign failed", err);
    res.status(500).json({ message: "Staff assign failed" });
  }
});


module.exports = router; 