const express = require('express');
const router = express.Router();
const Complaint = require('../../models/Complaint');
const User = require('../../models/User');

// ----------------------------------------------------------------------------------------------

// Get completed complaints for a specific staff member

router.get('/:registerNo', async (req, res) => {

    try {

        const { registerNo } = req.params;

        const staff = await User.findOne({
            registerNo: registerNo, role: 'staff'
        });

        if (!staff) {
            return res.status(404).json({
                message: 'Staff member not found'
            });
        }

        const complaints = await Complaint.find({
            assignedTo: staff._id,
            status: { $in: ['Resolved', 'Closed'] }
        })
            .populate('student', 'name registerNo email phone')
            .populate('category', 'name')
            .populate('department', 'name')
            .sort({ resolvedAt: -1, updatedAt: -1 });

        res.json({
            success: true,
            count: complaints.length,
            complaints: complaints
        });

    } catch (error) {
        console.error('Error fetching completed complaints:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// ----------------------------------------------------------------------------------------------

// Optional: Get completed complaints with date range filter

router.get('/completed/staff/:registerNo/range', async (req, res) => {

    try {

        const { registerNo } = req.params;
        const { startDate, endDate } = req.query;

        const staff = await User.findOne({
            registerNo: registerNo,
            role: 'staff'
        });

        if (!staff) {
            return res.status(404).json({
                message: 'Staff member not found'
            });
        }

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                resolvedAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const complaints = await Complaint.find({
            assignedTo: staff._id,
            status: { $in: ['Resolved', 'Closed'] },
            ...dateFilter
        })
            .populate('student', 'name registerNo email phone')
            .populate('category', 'name')
            .populate('department', 'name')
            .sort({ resolvedAt: -1 });

        res.json({
            success: true,
            count: complaints.length,
            complaints: complaints
        });

    } catch (error) {
        console.error('Error fetching completed complaints:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;