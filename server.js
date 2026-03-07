const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// ----------------------------------------------------------------------------------------------

// Admin Routes
const userManageRoutes = require("./routes/admin/userManage");
const departmentRoutes = require("./routes/admin/department");
const categoryRoutes = require("./routes/admin/category");
const assignComplaintsRoutes = require("./routes/admin/assignComplaints");
const grievanceInboxRoutes = require("./routes/admin/grievanceInbox");
const complaintReports = require("./routes/admin/complaintReports");

// Common Routes
const authRoutes = require("./routes/common/authentication");
const profileRoutes = require("./routes/common/profile");

// Staff routes
const staffAssignedRoutes = require("./routes/staff/assignedComplaints");
const updateComplaintsRoutes = require("./routes/staff/updateComplaints");
const completedComplaintsRoutes = require("./routes/staff/completedComplaints");

// Student routes
const myComplaintsRoutes = require("./routes/student/mycomplaints");
const raiseComplaintRoutes = require("./routes/student/raisecomplaint");
const ComplaintStatusTracker = require("./routes/student/complaintStatusTracker");
const complaintsHistoryRoutes = require("./routes/student/complaintsHistory");

// ----------------------------------------------------------------------------------------------

dotenv.config({ quiet: true });
connectDB();

// ----------------------------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

//----------------------------------------------------------------------------------------------

// Admin Routes
app.use("/api/userManage", userManageRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/complaints", assignComplaintsRoutes);
app.use("/api/grievanceInbox", grievanceInboxRoutes);
app.use("/api/complaintReports", complaintReports);

// Common Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Staff Routes
app.use("/api/staff/assigned", staffAssignedRoutes);
app.use("/api/staff/update", updateComplaintsRoutes);
app.use("/api/staff/completed", completedComplaintsRoutes);

// Student Routes
app.use("/api/mycomplaints", myComplaintsRoutes);
app.use("/api/complaints", raiseComplaintRoutes);
app.use("/api/complaintStatus", ComplaintStatusTracker);
app.use("/api/complaintHistory", complaintsHistoryRoutes);

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