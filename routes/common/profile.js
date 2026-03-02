const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// ----------------------------------------------------------------------------------------------

// Get user by register number

router.get("/users/:registerNo", async (req, res) => {

    try {

        const { registerNo } = req.params;
        const user = await User.findOne({ registerNo }).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

// Update user profile

router.put("/users/:registerNo", async (req, res) => {

    try {

        const { registerNo } = req.params;
        const { name, email, phone, department, semester } = req.body;

        if (email) {
            const existingUser = await User.findOne({
                email,
                registerNo: { $ne: registerNo }
            });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Update user
        const updatedUser = await User.findOneAndUpdate(
            { registerNo },
            {
                $set: {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(phone && { phone }),
                    ...(department && { department }),
                    ...(semester && { semester })
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;