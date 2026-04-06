const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    items: [{foodId: { type: mongoose.Schema.Types.ObjectId, required: true }, name: String, quantity: Number, price: Number }],
    totalAmount: Number,
    userName: String,
    userEmail: String,
    dorm: String,
    paymentMethod: String,
    otp: String,
    tokenNumber: { type: Number }, 
    status: { type: String, default: 'Pending' },
    isRated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);