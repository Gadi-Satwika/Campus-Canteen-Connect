const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');

exports.placeOrder = async (req, res) => {
    const { itemId, userId, quantityRequested } = req.body;

    try {
        // ATOMIC OPERATION: Decrease stock ONLY IF current stock >= requested
        const updatedItem = await FoodItem.findOneAndUpdate(
            { _id: itemId, quantity: { $gte: quantityRequested } },
            { $inc: { quantity: -quantityRequested } },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(400).json({ message: "Sold out or insufficient stock!" });
        }

        // Generate a 6-digit OTP for the student
        const otp = Math.floor(100000 + Math.random() * 900000);

        const newOrder = await Order.create({
            user: userId,
            item: itemId,
            quantity: quantityRequested,
            otp: otp,
            status: 'Pending'
        });

        res.status(201).json({ success: true, order: newOrder });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};