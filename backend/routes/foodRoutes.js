const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// Add new food item
router.post('/add', async (req, res) => {
    try {
        const newItem = new FoodItem(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all items for the Student Menu
router.get('/menu', async (req, res) => {
    try {
        const items = await FoodItem.find({ quantity: { $gt: 0 } });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;