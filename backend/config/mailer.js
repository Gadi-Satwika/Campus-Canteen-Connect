const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // This replaces host/port for simpler Gmail setup
  auth: {
    user: process.env.ADMIN_EMAIL,    // Ensure this matches your .env
    pass: process.env.ADMIN_PASSWORD // Your 16-digit App Password
  }
});

module.exports = transporter;