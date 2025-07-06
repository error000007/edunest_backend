// in this file we will write all the routes that are related to the authentication

const express = require('express');
const authRouter = express.Router();

// import the controllers
const { signUp, login, logout, loginAutomatic, sendOtp,googleLogin,googleSignUp, sendOtpToOwner, signUpAdmin } = require('../controllers/auth');

authRouter.post('/logout', logout);
authRouter.post('/automatic-login', loginAutomatic);
authRouter.post('/sendOtp', sendOtp);
authRouter.post('/signup', signUp);
authRouter.post('/googleLogin', googleLogin);
authRouter.post('/googleSignUp', googleSignUp);
authRouter.post('/login', login);
authRouter.post('/sendOtp_owner', sendOtpToOwner);
authRouter.post('/signup_Admin', signUpAdmin);


module.exports = authRouter;
