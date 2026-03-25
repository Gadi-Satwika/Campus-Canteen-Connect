const nodemailer = require('nodemailer');

// This is the "Canteen Post Office" configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'canteenstaffrgukt@gmail.com', 
    pass: 'jzpj afbl izml lkxo' // Not your login password, but a Google "App Password"
  }
});

module.exports = transporter;