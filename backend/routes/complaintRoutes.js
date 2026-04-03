const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // For deleting physical files

// 1. Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// 2. CREATE: Add Complaint (With Image)
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { studentName, studentEmail, subject, message } = req.body;
        const newComp = new Complaint({
            studentName,
            studentEmail,
            subject,
            message,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
        await newComp.save();
        res.status(201).json(newComp);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. READ: Get All (For Admin & Student Filtering)
router.get('/all', async (req, res) => {
    try {
        const all = await Complaint.find().sort({ createdAt: -1 });
        res.json(all);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. UPDATE: Edit Complaint (Handles optional new image)
router.put('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
            
            // Optional: Delete the OLD image file if a new one is uploaded
            const oldComp = await Complaint.findById(req.params.id);
            if (oldComp?.image) {
                const oldPath = path.join(__dirname, '..', oldComp.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }
        
        const updated = await Complaint.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. DELETE: Remove Complaint & Physical Image
router.delete('/:id', async (req, res) => {
    try {
        const comp = await Complaint.findById(req.params.id);
        if (comp?.image) {
            const filePath = path.join(__dirname, '..', comp.image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Deletes the file
        }
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ message: "Complaint and associated image deleted." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. ADMIN: Mark as Resolved (Specific Status Update)
router.put('/resolve/:id', async (req, res) => {
    try {
        const updated = await Complaint.findByIdAndUpdate(
            req.params.id, 
            { status: 'Resolved' }, 
            { new: true }
        );
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;