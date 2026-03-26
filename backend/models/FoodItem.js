const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Snacks'] }, // Added Enum
    quantity: { type: Number, default: 0 }, 
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true }); // Adding timestamps is good for sorting "Newest" items

module.exports = mongoose.model('FoodItem', FoodItemSchema);