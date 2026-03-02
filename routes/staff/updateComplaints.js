// routes/staff/updateComplaints.js
const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");
const User = require("../../models/User");

// PUT /api/staff/update/:complaintId - Update complaint status
router.put("/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { registerNo, status, remarks } = req.body;

    if (!registerNo) {
      return res.status(400).json({ 
        message: "Staff register number is required" 
      });
    }

    // Find staff
    const staff = await User.findOne({ 
      registerNo: registerNo,
      role: "staff" 
    });

    if (!staff) {
      return res.status(404).json({ 
        message: "Staff member not found" 
      });
    }

    // Find and update complaint
    const complaint = await Complaint.findOneAndUpdate(
      {
        _id: complaintId,
        assignedTo: staff._id
      },
      {
        status: status,
        $push: {
          updates: {
            status: status,
            remarks: remarks,
            updatedBy: staff._id,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ 
        message: "Complaint not found or not assigned to you" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint
    });

  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ 
      message: "Server error while updating complaint",
      error: error.message 
    });
  }
});

module.exports = router;