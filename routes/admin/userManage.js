const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// ----------------------------------------------------------------------------------------------

// Fetch user to show in user management page

router.get("/fetchUsers", async (req, res) => {

    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ----------------------------------------------------------------------------------------------

// Delete a user by ID

router.delete("/deleteUser/:id", async (req, res) => {

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

router.post("/createUser", async (req, res) => {

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

router.put("/updateUser/:id", async (req, res) => {

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

module.exports = router;