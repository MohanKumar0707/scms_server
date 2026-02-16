const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Department = require("../../models/Department");

// ----------------------------------------------------------------------------------------------

// Fetch departments for Department Management

router.get("/fetchDepartments", async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: "Error fetching departments" });
    }
});

// ----------------------------------------------------------------------------------------------

// Create a new department

router.post("/createDepartments", async (req, res) => {

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

router.put("/updateDepartments/:id", async (req, res) => {
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

router.delete("/deleteDepartments/:id", async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: "Department deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting department" });
    }
});

// ----------------------------------------------------------------------------------------------

module.exports = router;