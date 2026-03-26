const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// Add new food item
router.post('/add', async (req, res) => {
    try {
        // 1. Destructure ALL fields from the frontend request
        const { name, price, image, category, quantity } = req.body;

        // 2. Create the new item with the quantity field
        const newItem = new FoodItem({
            name,
            price: Number(price),
            image,
            category,
            quantity: Number(quantity), // THIS IS THE MISSING PIECE
            isAvailable: true
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error("Save Error:", err.message);
        res.status(500).json({ error: err.message });
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

router.delete('/:id', async (req, res) => {
    try {
        await FoodItem.findByIdAndDelete(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;