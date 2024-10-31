const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/database/connaction');
const authRoutes = require('./src/routes/user');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server :  http://localhost:${process.env.PORT}`);
});