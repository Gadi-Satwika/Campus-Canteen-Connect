const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Snacks'] },
    isAvailable: { type: Boolean, default: true }, 
    availabilityMode: { 
        type: String, 
        enum: ['Auto', 'Force Available'], 
        default: 'Auto' 
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    reviews: [
        {
            userId: String,
            userName: String,
            rating: Number,
            comment: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('FoodItem', FoodItemSchema);