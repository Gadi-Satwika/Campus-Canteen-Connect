const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: String, required: true }, // Student Email or ID
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    quantity: { type: Number, default: 1 },
    otp: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);