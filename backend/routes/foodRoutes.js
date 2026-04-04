const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// 1. ADD ITEM (Keep as is, but ensure schema defaults apply)
router.post('/add', async (req, res) => {
    try {
        const { name, price, image, category, quantity } = req.body;
        const newItem = new FoodItem({
            name,
            price: Number(price),
            image,
            category,
            quantity: Number(quantity),
            isAvailable: true,
            availabilityMode: 'Auto' // Default to Smart Timing
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET MENU (Modified for Real-World Logic)
router.get('/menu', async (req, res) => {
    try {
        // We fetch everything. The Frontend 'AvailabilityEngine' 
        // will decide if it's Grayscale or Clickable.
        const items = await FoodItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GENERIC UPDATE (Replaces /edit and /toggle)
// backend/routes/foodRoutes.js

// ONE ROUTE TO RULE THEM ALL
router.put('/update/:id', async (req, res) => {
    try {
        // req.body can now contain {isAvailable: false} OR {availabilityMode: 'Auto'} 
        // OR {price: 50}. It updates whatever it receives.
        const updatedItem = await FoodItem.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ message: "Item not found" });
        res.json(updatedItem);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE ITEM
router.delete('/:id', async (req, res) => {
    try {
        await FoodItem.findByIdAndDelete(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;