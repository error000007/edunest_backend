// in this file we will write all the routes that are related to the reset password

const express = require('express');
const resetPasswordRouter = express.Router();

// import the controllers
const { resetPasswordToken, resetPassword } = require('../controllers/resetPassword');

resetPasswordRouter.post('/resetPasswordToken', resetPasswordToken);
resetPasswordRouter.put('/resetPassword/:resetToken', resetPassword);

module.exports = resetPasswordRouter;
