// const express = require("express");
// const router = express.Router();
// const User = require("../../models/User");
// const Complaint = require("../../models/Complaint");

// // GET complaints assigned to a staff (by registerNo)
// router.get("/:registerNo", async (req, res) => {
//   try {
//     const { registerNo } = req.params;

//     // find staff user
//     const staff = await User.findOne({ registerNo, role: "staff" });
//     if (!staff) {
//       return res.status(404).json({ message: "Staff not found" });
//     }

//     // find complaints assigned to this staff
//     const complaints = await Complaint.find({ assignedTo: staff._id })
//       .populate("student", "name registerNo")
//       .populate("category", "name")
//       .populate("department", "name")
//       .sort({ createdAt: -1 });

//     res.json(complaints);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;


// routes/staff/assignedComplaints.js
const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");
const User = require("../../models/User");

// GET /api/staff/assigned - Get complaints assigned to a staff member
router.get("/", async (req, res) => {
  try {
    const { registerNo } = req.query;

    if (!registerNo) {
      return res.status(400).json({ 
        message: "Staff register number is required" 
      });
    }

    // Find the staff member by register number
    const staff = await User.findOne({ 
      registerNo: registerNo,
      role: "staff" 
    });

    if (!staff) {
      return res.status(404).json({ 
        message: "Staff member not found" 
      });
    }

    // Find complaints assigned to this staff member
    const complaints = await Complaint.find({ 
      assignedTo: staff._id 
    })
    .populate("student", "name registerNo email phone")
    .populate("category", "name")
    .populate("department", "name code")
    .sort({ 
      priority: -1, 
      createdAt: -1 
    });

    res.status(200).json({
      success: true,
      complaints,
      stats: {
        total: complaints.length,
        pending: complaints.filter(c => c.status === "Pending").length,
        inProgress: complaints.filter(c => c.status === "In Progress").length,
        resolved: complaints.filter(c => c.status === "Resolved").length,
        emergency: complaints.filter(c => c.priority === "Emergency").length
      }
    });

  } catch (error) {
    console.error("Error fetching assigned complaints:", error);
    res.status(500).json({ 
      message: "Server error while fetching complaints",
      error: error.message 
    });
  }
});

// GET /api/staff/assigned/:complaintId - Get specific complaint details
router.get("/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { registerNo } = req.query;

    if (!registerNo) {
      return res.status(400).json({ 
        message: "Staff register number is required" 
      });
    }

    const staff = await User.findOne({ 
      registerNo: registerNo,
      role: "staff" 
    });

    if (!staff) {
      return res.status(404).json({ 
        message: "Staff member not found" 
      });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      assignedTo: staff._id
    })
    .populate("student", "name registerNo email phone")
    .populate("category", "name priority")
    .populate("department", "name code")
    .populate("assignedTo", "name registerNo email");

    if (!complaint) {
      return res.status(404).json({ 
        message: "Complaint not found or not assigned to you" 
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });

  } catch (error) {
    console.error("Error fetching complaint details:", error);
    res.status(500).json({ 
      message: "Server error while fetching complaint details",
      error: error.message 
    });
  }
});

module.exports = router;