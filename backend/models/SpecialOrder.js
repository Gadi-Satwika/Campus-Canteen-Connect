const mongoose = require('mongoose');


const SpecialOrderSchema = new mongoose.Schema({
    title: { type: String, required: true },   
    subtitle: { type: String },                
    image: { type: String, required: true },
    price: { type: Number, required: true }, 
    quantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    reviews: [
        {
            userName: String,
            rating: Number,
            comment: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('SpecialOrder', SpecialOrderSchema);