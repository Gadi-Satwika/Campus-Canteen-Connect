const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  
const transporter = require('../config/mailer');     

// --- NEW: GET ORDERS FOR SPECIFIC USER (This was missing!) ---
router.get('/user/:email', async (req, res) => {
    try {
        const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. GET CURRENT SERVING
router.get('/current-serving', async (req, res) => {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const servingOrder = await Order.findOne({
            createdAt: { $gte: today },
            status: 'Ready'
        }).sort({ updatedAt: -1 });
        res.json({ tokenNumber: servingOrder ? servingOrder.tokenNumber : 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. PLACE ORDER
router.post('/place', async (req, res) => {
    try {
        const { items, totalAmount, userName, userEmail, dorm, paymentMethod } = req.body;
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(); end.setHours(23,59,59,999);
        const todayOrderCount = await Order.countDocuments({ createdAt: { $gte: start, $lte: end } });
        const tokenNumber = todayOrderCount + 1;

        const newOrder = new Order({
            items, totalAmount, userName, userEmail, dorm, paymentMethod,
            tokenNumber, status: 'Preparing',
            otp: Math.floor(100000 + Math.random() * 900000)
        });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. GET ALL ORDERS (History for last 10 days)
router.get('/all', async (req, res) => {
    try {
        const tenDaysAgo = new Date(); tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        const orders = await Order.find({ createdAt: { $gte: tenDaysAgo } }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. UPDATE STATUS & SEND EMAIL
router.put('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
    res.status(200).json(updated);
  } catch (err) { res.status(500).send(err); }
});

router.post('/send-cancellation-email', async (req, res) => {
  const { email, reason, orderId } = req.body;
  const mailOptions = {
    from: process.env.EMAIL_USER, to: email,
    subject: `❌ Order Cancelled - RKV Canteen`,
    html: `<p>Your order (ID: ${orderId}) was cancelled. Reason: ${reason}</p>`
  };
  try { await transporter.sendMail(mailOptions); res.status(200).send("Email Sent"); }
  catch (err) { res.status(500).send("Email Failed"); }
});

router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order Not Found" });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;