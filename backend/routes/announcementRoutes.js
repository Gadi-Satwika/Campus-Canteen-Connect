const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Admin adds announcement
router.post('/add', async (req, res) => {
    try {
        const newAnnounce = new Announcement(req.body);
        const saved = await newAnnounce.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student fetches latest active
router.get('/latest', async (req, res) => {
    try {
        const latest = await Announcement.findOne({ 
            status: { $regex: /^active$/i } 
        }).sort({ createdAt: -1 });
        res.json(latest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin fetches all for History
router.get('/all', async (req, res) => {
    try {
        const allData = await Announcement.find().sort({ createdAt: -1 });
        res.json(allData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// FIX: Changed '/revoke/:id' to '/update/:id' to match your Admin side axios call
router.put('/update/:id', async (req, res) => {
    try {
        const updated = await Announcement.findByIdAndUpdate(
            req.params.id, 
            req.body, // This allows revoking (sending {status: 'Revoked'}) or editing
            { new: true }
        );
        res.json(updated);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: "Successfully removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;