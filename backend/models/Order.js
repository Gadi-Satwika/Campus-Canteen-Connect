const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    items: [{ name: String, quantity: Number, price: Number }],
    totalAmount: Number,
    userName: String,
    userEmail: String,
    dorm: String,
    paymentMethod: String,
    otp: String,
    tokenNumber: { type: Number }, // <-- CRITICAL: This must exist
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);