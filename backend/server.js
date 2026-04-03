const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path');

// ... after your other imports
const announcementRoutes = require('./routes/announcementRoutes');

const complaintRoutes = require('./routes/complaintRoutes');
// const complaintRoutes = require('./routes/complaintRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ RGUKT Canteen DB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// Routes
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.use('/api/announcements', announcementRoutes);

app.use('/api/complaints', complaintRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use('/api/complaints', complaintRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));