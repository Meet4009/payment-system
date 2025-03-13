const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./database/connaction');
const userRoutes = require('./routes/userRoute');
const paymentRoutes = require('./routes/paymentRoutes');
const errorMiddleware = require('./middleware/error');
const bodyparser = require("body-parser");
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// static path

app.use(express.static(path.join(__dirname, 'public')));

// Set HBS as the view engine
app.set("view engine", "ejs");

// Set views directory
app.set("views", path.join(__dirname, "views"));

// MongoDB connection
connectDB();

// Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/payment', paymentRoutes);

app.use(errorMiddleware);


app.listen(process.env.PORT, () => {
    console.log(`server :  http://localhost:${process.env.PORT}`);
});