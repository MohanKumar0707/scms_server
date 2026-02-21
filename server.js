const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// ----------------------------------------------------------------------------------------------

// Admin Routes
const userManageRoutes = require("./routes/admin/userManage");
const departmentRoutes = require("./routes/admin/department");
const categoryRoutes = require("./routes/admin/category");
const adminGrievanceRoutes = require("./routes/admin/grievanceInbox");

// Common Routes
const authRoutes = require("./routes/common/authentication");

// Staff routes
const staffAssignedRoutes = require("./routes/staff/assignedComplaints");

// Student routes
const myComplaintsRoutes = require("./routes/student/mycomplaints");
const raiseComplaintRoutes = require("./routes/student/raisecomplaint");

// ----------------------------------------------------------------------------------------------

dotenv.config({ quiet: true });
connectDB();

// ----------------------------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

//----------------------------------------------------------------------------------------------

// Admin Routes
app.use("/api/userManage", userManageRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/complaints", adminGrievanceRoutes);

// Common Routes
app.use("/api/auth", authRoutes);

// Staff Routes
app.use("/api/staff/assigned", staffAssignedRoutes);

// Student Routes
app.use("/api/mycomplaints", myComplaintsRoutes);
app.use("/api/complaints", raiseComplaintRoutes);

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