const mongoose = require('mongoose');

// backend/models/SpecialOrder.js
const SpecialOrderSchema = new mongoose.Schema({
    title: { type: String, required: true },    // e.g., "Special Pulihora"
    subtitle: { type: String },                 // e.g., "Limited Saturday Special"
    image: { type: String, required: true },
    price: { type: Number, required: true },    // DIRECT PRICE
    quantity: { type: Number, default: 0 },     // DIRECT STOCK
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SpecialOrder', SpecialOrderSchema);