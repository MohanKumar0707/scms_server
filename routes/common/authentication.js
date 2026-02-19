const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// ----------------------------------------------------------------------------------------------

// Register a user using login page

router.post("/register", async (req, res) => {

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

router.post("/login", async (req, res) => {

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
                role: user.role,
                registerNo: user.registerNo,

            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;