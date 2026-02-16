const express = require("express");
const router = express.Router();
const Department = require("../../models/Department");
const Category = require("../../models/Category");
// ----------------------------------------------------------------------------------------------
// 2. CREATE CATEGORY
router.post("/createcategories", async (req, res) => {
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

router.get("/fetchcategories", async (req, res) => {
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
router.put('/updatecategories/:id', async (req, res) => {
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
router.delete('/deletecategories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// FETCH DEPARTMENTS (To populate your dropdown/selection)

router.get("/fetchDepartments/categories", async (req, res) => {
    try {
        const departments = await Department.find({}, "name _id");
        res.status(200).json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;