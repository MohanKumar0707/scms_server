const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");
const User = require("../../models/User");

// ----------------------------------------------------------------------------------------------

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ----------------------------------------------------------------------------------------------

router.post("/raisecomplaints", upload.single('image'), async (req, res) => {

    try {

        const { studentId, title, description, category, department, priority } = req.body;

        const user = await User.findOne({ registerNo: studentId });
        if (!user) return res.status(404).json({ message: "Student not found" });

        const complaint = new Complaint({
            student: user._id,
            title,
            description,
            category: category || null,
            department: department || null,
            priority: priority || "Medium",
            attachments: req.file ? [`/uploads/${req.file.filename}`] : []
        });

        const saved = await complaint.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;