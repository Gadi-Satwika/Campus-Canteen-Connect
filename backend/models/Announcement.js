const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['Urgent', 'Info', 'Holiday'], default: 'Info' },
    status: { type: String, default: 'Active' } // Added this so 'Active'/'Revoked' works
},{ timestamps: true }); // Timestamps automatically handle createdAt and updatedAt

module.exports = mongoose.model('Announcement', AnnouncementSchema);