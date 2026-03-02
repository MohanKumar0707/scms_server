const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Complaint = require('../../models/Complaint');
const ComplaintHistory = require('../../models/ComplaintHistory');
const User = require('../../models/User');

// ----------------------------------------------------------------------------------------------

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// ----------------------------------------------------------------------------------------------

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images are allowed'));
    }
});

// ----------------------------------------------------------------------------------------------

router.get('/', async (req, res) => {

    try {

        const { registerNo } = req.query;
        if (!registerNo) return res.status(400).json({ message: 'registerNo required' });

        // Find staff user by registerNo
        const staff = await User.findOne({ registerNo, role: 'staff' });
        if (!staff) return res.status(404).json({ message: 'Staff not found' });

        // Get complaints assigned to this staff
        const complaints = await Complaint.find({ assignedTo: staff._id })
            .populate('student', 'name registerNo')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------------------------------------------------

router.get('/:complaintId/history', async (req, res) => {

    try {

        const { complaintId } = req.params;
        const { registerNo } = req.query;

        const staff = await User.findOne({ registerNo, role: 'staff' });
        if (!staff) return res.status(403).json({ message: 'Unauthorized' });

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        if (complaint.assignedTo.toString() !== staff._id.toString()) {
            return res.status(403).json({ message: 'Not assigned to you' });
        }

        const history = await ComplaintHistory.find({ complaint: complaintId })
            .populate('updatedBy', 'name registerNo')
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------------------------------------------------

router.put('/:complaintId', upload.array('photos', 5), async (req, res) => {

    try {

        const { complaintId } = req.params;
        const { status, description, charges, registerNo } = req.body;
        const files = req.files;

        // Find staff
        const staff = await User.findOne({ registerNo, role: 'staff' });
        if (!staff) return res.status(403).json({ message: 'Unauthorized' });

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        if (complaint.assignedTo.toString() !== staff._id.toString()) {
            return res.status(403).json({ message: 'Not assigned to you' });
        }

        const photoUrls = files ? files.map(file => `/uploads/${file.filename}`) : [];

        if (status && status !== complaint.status) {
            complaint.status = status;
            if (status === 'Resolved') complaint.resolvedAt = new Date();
            await complaint.save();
        }

        // Create history entry
        const historyEntry = new ComplaintHistory({
            complaint: complaintId,
            updatedBy: staff._id,
            status: status || complaint.status,
            title: complaint.title,
            description: description || '',
            photos: photoUrls,
            charges: charges || 0
        });
        await historyEntry.save();

        const updatedHistory = await ComplaintHistory.find({ complaint: complaintId })
            .populate('updatedBy', 'name registerNo')
            .sort({ createdAt: -1 });

        res.json({ message: 'Complaint updated', history: updatedHistory });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;