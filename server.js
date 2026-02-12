const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

// ----------------------------------------------------------------------------------------------

dotenv.config({ quiet: true });
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------------------------------

const User = require('./models/User');
const Department = require('./models/Department');
const Category = require('./models/Category');

// ----------------------------------------------------------------------------------------------

app.get("/", (req, res) => {
    res.send("Complaint Tracking API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);

// ----------------------------------------------------------------------------------------------

// Fetch user to show in user management page

app.get("/api/users", async (req, res) => {

    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ----------------------------------------------------------------------------------------------

// Delete a user by ID

app.delete("/api/users/:id", async (req, res) => {

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// ----------------------------------------------------------------------------------------------

// Create a user

app.post("/api/users", async (req, res) => {

    try {

        const { registerNo, name, email, phone, password, role, department, semester } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const newUser = new User({
            registerNo,
            name,
            email,
            phone,
            password,
            role,
            department,
            semester
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error creating user" });
    }
});

// ----------------------------------------------------------------------------------------------

// Update a user

app.put("/api/users/:id", async (req, res) => {

    try {

        const updateData = { ...req.body };

        if (!updateData.password) {
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Error updating user" });
    }
});

// ----------------------------------------------------------------------------------------------

// Register a user using login page

app.post("/api/auth/register", async (req, res) => {

    try {

        const { registerNo, name, email, phone, password, department, role } = req.body;

        if (!registerNo || !name || !email || !password || !department) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const user = new User({
            registerNo: registerNo, name: name, email: email,
            phone: phone, password: password, department: department,
            role: role || "student"
        });

        await user.save();

        res.status(201).json({
            message: "Account created successfully",
            userId: user._id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

// Login user using login page

app.post("/api/auth/login", async (req, res) => {

    try {

        const { registerNo, password } = req.body;

        if (!registerNo || !password) {
            return res.status(400).json({ message: "Missing credentials" });
        }

        const user = await User.findOne({ registerNo });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                name: user.name,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

// Fetch departments for Department Management

app.get("/api/departments", async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: "Error fetching departments" });
    }
});

// ----------------------------------------------------------------------------------------------

// Create a new department

app.post("/api/departments", async (req, res) => {

    try {

        const { name, code, description } = req.body;

        const exists = await Department.findOne({ code });
        if (exists) {
            return res.status(400).json({ message: "Department code already exists" });
        }

        const newDept = new Department({ name, code, description });
        await newDept.save();
        res.status(201).json(newDept);
    } catch (err) {
        res.status(500).json({ message: "Error creating department" });
    }
});

// ----------------------------------------------------------------------------------------------

// Update a department

app.put("/api/departments/:id", async (req, res) => {
    try {
        const updatedDept = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedDept);
    } catch (err) {
        res.status(500).json({ message: "Error updating department" });
    }
});

// ----------------------------------------------------------------------------------------------

// Delete a department

app.delete("/api/departments/:id", async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: "Department deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting department" });
    }
});

// ----------------------------------------------------------------------------------------------
// FETCH DEPARTMENTS (To populate your dropdown/selection)

app.get("/api/departments/categories", async (req, res) => {
    try {
        const departments = await Department.find({}, "name _id");
        res.status(200).json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE CATEGORY
app.post("/api/categories", async (req, res) => {
    try {
        const { name, department, priority } = req.body;

        const newCategory = new Category({
            name,
            department: department, // This must be a valid ObjectId
            priority
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (err) {
        console.error("error ", err);
        res.status(400).json({ error: err.message });
    }
});

app.get("/api/categories", async (req, res) => {
    try {
        const categories = await Category
            .find()
            .populate("department", "name _id");

        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update an existing category
app.put('/api/categories/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                department: req.body.department,
                priority: req.body.priority
            },
            { new: true }
        );
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE: Remove a category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ----------------------------------------------------------------------------------------------