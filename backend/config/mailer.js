const nodemailer = require('nodemailer');

// Manual configuration to bypass cloud network restrictions
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD
  },
  tls: {
    // This allows the mail to send even if the cloud server has strict SSL rules
    rejectUnauthorized: false 
  }
});

module.exports = transporter;