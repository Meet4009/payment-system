const express = require('express');
const connectDB = require('./src/database/connaction');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const authRoutes = require('./src/routes/user');

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server :  http://localhost:${process.env.PORT}`);
});