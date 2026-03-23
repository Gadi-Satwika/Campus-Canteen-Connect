const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));