// in this controller all the business logic that are related to reset password are written

const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendMail } = require('../utils/mailSender');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// reset password token ----w
exports.resetPasswordToken = async (req, res) => {
    try {

        // verify the email from req.body
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        // verify the validity of the email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        // check the user with the email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Create a JWT token that expires in 5 minutes
        const resetToken = jwt.sign(
            {
                email: user.email,
                id: user._id
            },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        // Create the reset URL with the token
        const resetPasswordUrl = `${process.env.FRONTEND_URL}/create-new-password/${resetToken}`;

        // Calculate expiry time for user-friendly message
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString();

        // send the mail
        try {
            await sendMail(
                email,
                "Password Reset Request",
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #333; border-radius: 5px; background-color: #000; color: #fff;">
    <!-- Header -->
    <div style="background: #d10000; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
        <h2 style="color: #fff; margin: 0; font-size: 24px;">PASSWORD RESET REQUEST</h2>
    </div>
    
    <!-- Content -->
    <div style="padding: 20px;">
        <p style="margin-bottom: 15px;">You have requested to reset your password. Please click the button below to reset it:</p>
        
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #d10000; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
            </a>
        </div>
        
        <p style="margin-bottom: 20px;">This link will expire at <strong style="color: #d10000;">${expiryTime}</strong>. If you did not request a password reset, please ignore this email.</p>
    </div>
    
    <!-- Footer -->
    <div style="padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #333;">
        Thank you for using our platform.<br>
        <span style="color: #d10000; font-weight: bold;">EDUNEST</span>
    </div>
</div>

                `
            );

            return res.status(200).json({
                success: true,
                message: "Password reset link sent to your email"
            });

        } catch (emailError) {
            return res.status(500).json({
                success: false,
                message: "Error sending reset password email"
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occurred while generating reset token"
        });
    }
}
// reset password ----w
exports.resetPassword = async (req, res) => {
    try {

        // fetch data from req.body
        const resetToken = req.params.resetToken;
        const { email, password, confirmPassword } = req.body;
        if (!resetToken || !password || !confirmPassword || !email) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // verify the password and confirmPassword
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirmPassword do not match"
            });
        }

        // decode and verify the resetToken
        let decode;
        try {
            decode = jwt.verify(resetToken, process.env.JWT_SECRET);
            if (decode.email != email) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid reset token, email mismatch"
                })
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Reset link has expired, please generate a new one"
                });
            }
            return res.status(401).json({
                success: false,
                message: "Invalid reset token"
            });
        }

        // check the user with the email
        const currentUser = await User.findOne({ email: decode.email });
        if (!currentUser) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update the password
        currentUser.password = hashedPassword;
        await currentUser.save();

        // send the mail
        try {
            await sendMail(email, "Password Reset Successful",
                `

       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #333; border-radius: 5px; background-color: #000; color: #fff;">
    <!-- Header -->
    <div style="background: #d10000; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
        <h2 style="color: #fff; margin: 0; font-size: 24px;">PASSWORD RESET SUCCESSFUL</h2>
    </div>
    
    <!-- Content -->
    <div style="padding: 20px;">
        <p style="margin-bottom: 15px;">Your password has been successfully reset. You can now log in with your new password.</p>
        
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #d10000; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Log In
            </a>
        </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #333;">
        Thank you for using our platform.<br>
        <span style="color: #d10000; font-weight: bold;">EDUNEST</span>
    </div>
</div>

                `);
        } catch (error) {
            console.error("Error sending reset password email:", error);
        }

        return res.status(200).json({
            success: true,
            message: "Password reset successful, login to continue"
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while resetting password"
        });
    }
}
