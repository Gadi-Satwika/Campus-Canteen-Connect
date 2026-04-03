const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    studentName: String,
    studentEmail: String,
    subject: { type: String, required: true },
    image: { type: String, default: null },
    message: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Resolved', 'Withdrawn'],default: 'Pending' } // Pending, Under Review, Resolved
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);