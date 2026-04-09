const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  // Using the direct IPv4 host address for Gmail to prevent IPv6 errors
  host: '74.125.137.108', 
  port: 587,
  secure: false, 
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
  // This forces Node to use IPv4 only
  family: 4, 
  tls: {
    // This allows the connection to proceed even if the IP address doesn't match the SSL name
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false
  },
  connectionTimeout: 20000 
});

module.exports = transporter;