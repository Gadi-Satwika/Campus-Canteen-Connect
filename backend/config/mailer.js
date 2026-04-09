const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true, // This is mandatory for port 465
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 20000 
});

module.exports = transporter;