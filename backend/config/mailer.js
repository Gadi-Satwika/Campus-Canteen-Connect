const nodemailer = require('nodemailer');

// This is the "Canteen Post Office" configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD // Not your login password, but a Google "App Password"
  }
});

module.exports = transporter;