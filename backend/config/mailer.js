const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
  // FORCE IPv4 to bypass the ENETUNREACH error
  family: 4, 
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 15000 
});

module.exports = transporter;