const express = require("express"); 
const router = express.Router();
const Complaint = require("../../models/Complaint");
const User = require("../../models/User");

// ----------------------------------------------------------------------------------------------

router.post("/raisecomplaints", async (req, res) => {

    try {
        
        const { studentId, title, description, category, department, priority } = req.body;

        if (!studentId || !title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        const user = await User.findOne({ registerNo: studentId });
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }

        const complaint = new Complaint({
            student: user._id,
            title: title,
            description: description,
            category: category || null,
            department: department || null,
            priority: priority || "Medium",
            status: "Pending"
        });

        const saved = await complaint.save();
        const populated = await saved.populate("student category department assignedTo");
        res.status(201).json(populated);

    } catch (err) {
        console.error('Error creating complaint : ', err);
        res.status(400).json({ message: err.message });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;