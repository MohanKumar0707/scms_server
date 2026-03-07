const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");
const User = require("../../models/User");
const Category = require("../../models/Category");
const Department = require("../../models/Department");

// ----------------------------------------------------------------------------------------------

router.get("/stats", async (req, res) => {

    try {

        const { role, registerNo, range = "week" } = req.query;

        if (!role || !registerNo) {
            return res.status(400).json({ message: "Missing role or registerNo" });
        }

        const user = await User.findOne({ registerNo });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Date range filter
        let startDate = new Date();
        if (range === "week") startDate.setDate(startDate.getDate() - 7);
        else if (range === "month") startDate.setMonth(startDate.getMonth() - 1);
        else if (range === "year") startDate.setFullYear(startDate.getFullYear() - 1);
        else startDate = new Date(0); // all time

        const dateFilter = { createdAt: { $gte: startDate } };

        // Common stats
        const totalComplaints = await Complaint.countDocuments(dateFilter);
        const pendingComplaints = await Complaint.countDocuments({ ...dateFilter, status: "Pending" });
        const resolvedComplaints = await Complaint.countDocuments({ ...dateFilter, status: "Resolved" });
        const inProgressComplaints = await Complaint.countDocuments({ ...dateFilter, status: "In Progress" });

        // Category distribution
        const categoryAgg = await Complaint.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
            { $unwind: "$cat" },
            { $project: { name: "$cat.name", value: "$count" } }
        ]);
        const categoryData = categoryAgg.map(c => ({ name: c.name, value: c.value }));

        // Time series data (daily)
        const timeAgg = await Complaint.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", count: 1, _id: 0 } }
        ]);
        const timeData = timeAgg;

        const stats = {
            totalComplaints,
            pendingComplaints,
            resolvedComplaints,
            inProgressComplaints,
            categoryData,
            timeData,
        };

        // Role-specific
        if (role === "admin") {
            const deptAgg = await Complaint.aggregate([
                { $match: dateFilter },
                { $group: { _id: "$department", count: { $sum: 1 } } },
                { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "dept" } },
                { $unwind: "$dept" },
                { $project: { name: "$dept.name", complaints: "$count" } }
            ]);
            stats.departmentData = deptAgg;

            const recent = await Complaint.find(dateFilter)
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("student", "name");
            stats.recentComplaints = recent.map(c => ({
                title: c.title,
                studentName: c.student.name,
                createdAt: c.createdAt
            }));
        }

        if (role === "staff") {
            const assigned = await Complaint.find({ ...dateFilter, assignedTo: user._id })
                .populate("student", "name")
                .sort({ createdAt: -1 });
            stats.assignedComplaints = assigned.map(c => ({
                complaintId: c.complaintId,
                title: c.title,
                studentName: c.student.name,
                status: c.status,
                priority: c.priority
            }));
        }

        if (role === "student") {
            const myComplaints = await Complaint.find({ ...dateFilter, student: user._id })
                .sort({ createdAt: -1 })
                .limit(5);
            stats.myComplaints = myComplaints.map(c => ({
                complaintId: c.complaintId,
                title: c.title,
                status: c.status,
                createdAt: c.createdAt
            }));
        }

        res.json(stats);
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;