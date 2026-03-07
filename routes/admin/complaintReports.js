const express = require("express");
const router = express.Router();
const Complaint = require("../../models/Complaint");
const Category = require("../../models/Category");
const Department = require("../../models/Department");
const User = require("../../models/User");

// ----------------------------------------------------------------------------------------------

router.get("/dashboard", async (req, res) => {

    try {

        // 1. Basic counts
        const totalComplaints = await Complaint.countDocuments();
        const pendingComplaints = await Complaint.countDocuments({ status: "Pending" });
        const inProgressComplaints = await Complaint.countDocuments({ status: "In Progress" });
        const resolvedComplaints = await Complaint.countDocuments({ status: "Resolved" });
        const rejectedComplaints = await Complaint.countDocuments({ status: "Rejected" });

        // 2. Complaints by status (for pie chart)
        const complaintsByStatus = await Complaint.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // 3. Complaints by priority
        const complaintsByPriority = await Complaint.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);

        // 4. Complaints by category (with category name lookup)
        const complaintsByCategory = await Complaint.aggregate([
            { $match: { category: { $ne: null } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
            { $unwind: "$category" },
            { $project: { categoryName: "$category.name", count: 1 } }
        ]);

        // 5. Complaints by department (with department name lookup)
        const complaintsByDepartment = await Complaint.aggregate([
            { $match: { department: { $ne: null } } },
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "dept" } },
            { $unwind: "$dept" },
            { $project: { departmentName: "$dept.name", count: 1 } }
        ]);

        // 6. Average resolution time (for resolved complaints)
        const avgResolutionTime = await Complaint.aggregate([
            { $match: { status: "Resolved", resolvedAt: { $exists: true } } },
            {
                $project: {
                    resolutionTime: { $subtract: ["$resolvedAt", "$createdAt"] } // in milliseconds
                }
            },
            { $group: { _id: null, avgTime: { $avg: "$resolutionTime" } } }
        ]);

        const avgResolutionHours = avgResolutionTime.length > 0
            ? (avgResolutionTime[0].avgTime / (1000 * 60 * 60)).toFixed(2)
            : 0;

        // 7. Recent complaints (last 10)
        const recentComplaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("student", "name registerNo")
            .populate("category", "name")
            .populate("department", "name")
            .lean();

        // Combine everything
        res.json({
            overview: {
                total: totalComplaints,
                pending: pendingComplaints,
                inProgress: inProgressComplaints,
                resolved: resolvedComplaints,
                rejected: rejectedComplaints,
                avgResolutionHours
            },
            byStatus: complaintsByStatus,
            byPriority: complaintsByPriority,
            byCategory: complaintsByCategory,
            byDepartment: complaintsByDepartment,
            recent: recentComplaints
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

router.get("/complaints", async (req, res) => {

    try {

        const { status, priority, department, category, fromDate, toDate, page = 1, limit = 20 } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (department) filter.department = department;
        if (category) filter.category = category;
        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch complaints with populated fields
        const complaints = await Complaint.find(filter)
            .populate("student", "name registerNo email phone")
            .populate("category", "name")
            .populate("department", "name")
            .populate("assignedTo", "name")
            .sort({ createdAt: -1 })
            .skip(skip).limit(parseInt(limit))
            .lean();

        // Total count for pagination
        const total = await Complaint.countDocuments(filter);

        // Summary statistics for the filtered set
        const summary = await Complaint.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } }
                }
            }
        ]);

        res.json({
            complaints,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            summary: summary[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

// GET /api/admin/reports/filter-options

router.get("/filter-options", async (req, res) => {
    try {
        const departments = await Department.find().select("name").lean();
        const categories = await Category.find().populate("department", "name").lean();
        res.json({ departments, categories });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;