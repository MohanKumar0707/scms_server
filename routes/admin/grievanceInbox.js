const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");

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

module.exports = router;