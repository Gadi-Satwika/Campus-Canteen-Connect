const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  
const transporter = require('../config/mailer');     

// 1. GET CURRENT SERVING (Polled every 5s by Menu.jsx)
router.get('/current-serving', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the LATEST order that was moved to 'Ready' status today
        const servingOrder = await Order.findOne({
            createdAt: { $gte: today },
            status: 'Ready'
        }).sort({ updatedAt: -1 }); // Sort by most recent update

        res.json({ tokenNumber: servingOrder ? servingOrder.tokenNumber : 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. PLACE ORDER
router.post('/place', async (req, res) => {
    try {
        // FIXED: Destructured userEmail from req.body so it isn't "undefined"
        const { items, totalAmount, userName, userEmail, dorm, paymentMethod } = req.body;

        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setHours(23,59,59,999);

        const todayOrderCount = await Order.countDocuments({
            createdAt: { $gte: start, $lte: end }
        });

        const tokenNumber = todayOrderCount + 1;

        const newOrder = new Order({
            items,
            totalAmount,
            userName,
            userEmail, // Now defined!
            dorm,
            paymentMethod,
            tokenNumber,
            status: 'Preparing',
            otp: Math.floor(100000 + Math.random() * 900000)
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error("Place Order Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. GET ALL ORDERS (History for last 10 days)
router.get('/all', async (req, res) => {
    try {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const orders = await Order.find({
            createdAt: { $gte: tenDaysAgo }
        }).sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE STATUS & SEND EMAIL
router.put('/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (status === 'Ready' && order && order.userEmail) {
            const mailOptions = {
                from: '"RKV Canteen"',
                to: order.userEmail,
                subject: `Order Ready! Token #${order.tokenNumber}`,
                html: `<h1>Hi ${order.userName}, your order is ready for collection!</h1>`
            };
            transporter.sendMail(mailOptions);
        }
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. GET SINGLE ORDER (For Scanner)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order Not Found" });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. DELETE ORDER
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;