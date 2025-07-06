const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'token not found or expired, please login again'
            })
        }

        // verify the token
        const decode = jwt.verify(token, process.env.JWT_SECRET);   
        if (!decode) {
            return res.status(401).json({
                success: false,
                message: 'invalid token'
            })
        }
        // check the authenticity of the token
        const currentUser = await User.findById(decode.id);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'token is invalid, user not found'
            })
        }

        // attach the user to the request
        req.user = decode;

        // call the next middleware
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'internal server error, unable to authenticate the user via token'
        })
    }
}

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: 'unauthorized access, only admin can access this page'
            })
        }

        // call the next middleware
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'internal server error, unable to check the account type Admin'
        })

    }
}

exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: 'unauthorized access, only student can access this page'
            })
        }

        // call the next middleware
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'internal server error, unable to check the account type Student'
        })

    }
}

exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: 'unauthorized access, only Instructor can access this page'
            })
        }

        // call the next middleware
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'internal server error, unable to check the account type Instructor'
        })

    }
}