const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./database/connaction');
const userRoutes = require('./routes/userRoute');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
connectDB();

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server :  http://localhost:${PORT}`);
});