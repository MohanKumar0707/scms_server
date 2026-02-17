const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Complaint = require("../../models/Complaint");


// Express route example
router.get('/api/complaints', async (req, res) => {
    try {
        // student field-ah populate panni adhula iruka name-ah edukirom
        const complaints = await Complaint.find()
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

module.exports = router; 