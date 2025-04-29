const razorpay = require('razorpay');
require('dotenv').config()

// razorpay instance ---
exports.razorPayInstance = new razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});                                                              