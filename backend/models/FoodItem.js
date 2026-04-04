const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Snacks'] },
    isAvailable: { type: Boolean, default: true }, // Admin's manual Kill-Switch
    availabilityMode: { 
        type: String, 
        enum: ['Auto', 'Force Available'], 
        default: 'Auto' 
    }
}, { timestamps: true });

module.exports = mongoose.model('FoodItem', FoodItemSchema);