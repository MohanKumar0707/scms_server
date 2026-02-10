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

// CREATE USER (POST)

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

// UPDATE USER (PUT)

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

// REGISTER

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

// LOGIN

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
