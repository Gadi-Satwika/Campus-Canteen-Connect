const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); 
const FoodItem = require('../models/FoodItem');
const SpecialOrder = require('../models/SpecialOrder');


router.post('/rate/:id', async (req, res) => {
    try {
        const { rating, comment, userName, orderId } = req.body;
        const targetId = req.params.id;

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, { isRated: true });
        }
        let item = await FoodItem.findById(targetId) || await SpecialOrder.findById(targetId);

        if (!item) {
            return res.status(404).json({ message: "Food item no longer exists in menu" });
        }

        if (!item.ratings) item.ratings = { average: 0, count: 0 };
        const oldCount = item.ratings.count || 0;
        const oldAvg = item.ratings.average || 0;
        
        item.ratings.count = oldCount + 1;
        item.ratings.average = ((oldAvg * oldCount) + Number(rating)) / (oldCount + 1);
        item.reviews.push({ userName, rating: Number(rating), comment });

        await item.save();
        res.json({ message: "Review Saved" });

    } catch (err) {
        console.error("Rating Error:", err);
        res.status(500).json({ error: err.message });
    }
});


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

router.get('/menu', async (req, res) => {
    try {
        const items = await FoodItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

router.delete('/:id', async (req, res) => {
    try {
        await FoodItem.findByIdAndDelete(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;