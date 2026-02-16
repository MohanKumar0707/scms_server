const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// ----------------------------------------------------------------------------------------------

const userManageRoutes = require("./routes/admin/userManage");
const departmentRoutes = require("./routes/admin/department");
const categoryRoutes = require("./routes/admin/category");
const authRoutes = require("./routes/common/authentication");
const myComplaintsRoutes = require("./routes/student/mycomplaints");

// ----------------------------------------------------------------------------------------------

dotenv.config({ quiet: true });
connectDB();

// ----------------------------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());
//----------------------------------------------------------------------------------------------
app.use("/api/userManage", userManageRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", myComplaintsRoutes);

// ----------------------------------------------------------------------------------------------

const User = require('./models/User');
const Department = require('./models/Department');
const Category = require('./models/Category');
const Complaint = require('./models/Complaint');


// ----------------------------------------------------------------------------------------------

app.get("/", (req, res) => {
    res.send("Complaint Tracking API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);

// ----------------------------------------------------------------------------------------------

// CREATE COMPLAINT
app.post("/api/complaints", async (req, res) => {
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
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// GET ALL COMPLAINTS
app.get("/api/complaints", async (req, res) => {
    try {
        const complaints = await Complaint
            .find()
            .populate("student", "name email registerNo")
            .populate("category", "name")
            .populate("department", "name")
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET COMPLAINTS BY STUDENT ID
app.get("/api/complaints/student/:studentId", async (req, res) => {
    try {
        const complaints = await Complaint
            .find({ student: req.params.studentId })
            .populate("category", "name")
            .populate("department", "name")
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE COMPLAINT
app.put("/api/complaints/:id", async (req, res) => {
    try {
        const updated = await Complaint.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate("student category department assignedTo");

        if (!updated) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE COMPLAINT
app.delete("/api/complaints/:id", async (req, res) => {
    try {
        const deleted = await Complaint.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        res.json({ message: "Complaint deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
