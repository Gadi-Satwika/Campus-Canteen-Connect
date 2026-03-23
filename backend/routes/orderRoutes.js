const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem'); // Check if this file exists!
const Order = require('../models/Order');       // Check if this file exists!

// This is for the STUDENT to buy food
router.post('/place', async (req, res) => {
    try {
        const { itemId, userId, quantityRequested } = req.body;

        const updatedItem = await FoodItem.findOneAndUpdate(
            { _id: itemId, quantity: { $gte: quantityRequested } },
            { $inc: { quantity: -quantityRequested } },
            { new: true }
        );

        if (!updatedItem) return res.status(400).json({ message: "Out of stock!" });

        const otp = Math.floor(100000 + Math.random() * 900000);
        const newOrder = await Order.create({
            user: userId,
            item: itemId,
            quantity: quantityRequested,
            otp: otp
        });

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Admin - Fetch all live orders with item details
router.get('/all', async (req, res) => {
    try {
        // .populate('item') fills the item ID with actual name/price from the FoodItem model
        const orders = await Order.find().populate('item').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: 'Completed' }, 
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;