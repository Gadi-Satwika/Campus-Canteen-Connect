const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, enum: ['Breakfast', 'Lunch', 'Snacks', 'Drinks'] },
    image: { type: String }, // URL of the image
    quantity: { type: Number, default: 0 }, // How many are left
    isAvailable: { type: Boolean, default: true },
    isGirlsOnly: { type: Boolean, default: true } // Since you mentioned the focus
}, { timestamps: true });

module.exports = mongoose.model('FoodItem', FoodItemSchema);