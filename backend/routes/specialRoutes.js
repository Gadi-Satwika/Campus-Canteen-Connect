const express = require('express');
const router = express.Router();
const SpecialOrder = require('../models/SpecialOrder');

// GET ALL BANNERS
router.get('/all', async (req, res) => {
    try {
        const banners = await SpecialOrder.find({ isActive: true });
        res.json(banners);
    } catch (err) { res.status(500).json(err); }
});

// ADD NEW BANNER
router.post('/add', async (req, res) => {
    try {
        const newBanner = new SpecialOrder(req.body);
        await newBanner.save();
        res.status(201).json(newBanner);
    } catch (err) { res.status(500).json(err); }
});

// DELETE BANNER
router.delete('/:id', async (req, res) => {
    try {
        await SpecialOrder.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;