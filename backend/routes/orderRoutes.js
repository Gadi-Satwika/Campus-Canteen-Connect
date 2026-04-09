const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  
const transporter = require('../config/mailer');     

router.get('/user/:email', async (req, res) => {
    try {
        const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        
        console.log(`Found ${orders.length} orders for ${req.params.email}`);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

router.get('/all', async (req, res) => {
    try {
        const tenDaysAgo = new Date(); tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        const orders = await Order.find({ createdAt: { $gte: tenDaysAgo } }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/status/:id', async (req, res) => {
  try {
    const { status, reason } = req.body;

    // 1. Update the order status in MongoDB first
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true } 
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. SEND SUCCESS RESPONSE IMMEDIATELY
    // This ensures your popup appears instantly and stops the "Timeout" error
    res.status(200).json(updatedOrder);

    // 3. HANDLE EMAILS IN THE BACKGROUND (Notice: No 'await' here)
    if (status === 'Deleted' && reason) {
        const mailOptions = {
            from: `"RKV Canteen Support" <${process.env.ADMIN_EMAIL}>`,
            to: updatedOrder.userEmail,
            subject: `❌ Order Cancelled - Token #${updatedOrder.tokenNumber}`,
            html: `<h3>Hi ${updatedOrder.userName},</h3>
                   <p>Your order has been cancelled.</p>
                   <p><b>Reason:</b> ${reason}</p>`
        };
        // No await: let it finish in the background
        transporter.sendMail(mailOptions).catch(e => console.log("Email Error:", e.message));
    }

    if (status === 'Ready' && updatedOrder.userEmail) {
        const mailOptions = {
            from: `"RKV Canteen" <${process.env.ADMIN_EMAIL}>`,
            to: updatedOrder.userEmail,
            subject: `🍔 Order Ready! Token #${updatedOrder.tokenNumber}`,
            html: `<h2>Hi ${updatedOrder.userName},</h2>
                   <p>Your delicious food is ready!</p>
                   <p><b>Token Number:</b> #${updatedOrder.tokenNumber}</p>`
        };
        // No await: let it finish in the background
        transporter.sendMail(mailOptions).catch(e => console.log("Email Error:", e.message));
    }

  } catch (err) {
    console.error("Status Update Error:", err);
    // Only send error if we haven't already sent the success response
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

router.post('/send-cancellation-email', async (req, res) => {
  const { email, reason, orderId } = req.body;
  const mailOptions = {
    from: process.env.ADMIN_EMAIL, to: email,
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