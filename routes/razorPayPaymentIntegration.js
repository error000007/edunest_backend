// in this file we will write all the routes that are related to the razorPay payment integration

const express = require('express');
const razorPayPaymentIntegrationRouter = express.Router();

// import the controllers
const { verifypayment, capturePayment } = require('../controllers/razorPayPaymentIntegration');

// import the middleware
const { isAuthenticated, isStudent } = require('../middlewares/auth');

razorPayPaymentIntegrationRouter.post('/verifypayment', isAuthenticated, isStudent, verifypayment);
razorPayPaymentIntegrationRouter.post('/capturePayment', isAuthenticated, isStudent, capturePayment);


module.exports = razorPayPaymentIntegrationRouter;

