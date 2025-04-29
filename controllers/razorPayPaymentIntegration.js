// in this controller we will write all the code related to payment integration of the webpage with razorpay

const Razorpay = require('razorpay');
const { razorPayInstance } = require('../config/razorpayIntegration');
const Course = require('../models/Course');
const User = require('../models/User');
const { sendMail } = require('../utils/mailSender');
const crypto = require('crypto');

// initiate the razoprpay order 
exports.capturePayment = async (req, res) => {
    // actually the array of courses id that the user want to purchase
    const { courses } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (courses.length == 0) {
        return res.json({
            success: false,
            message: "no course selected for purchase"
        })
    }
    // calculating the total amount
    let totalAmt = 0;
    for (i = 0; i < courses.length; i++) {
        try {
            const purchasingCourse = await Course.findById(courses[i]);
            if (!purchasingCourse) {
                return res.json({
                    success: false,
                    message: "unable to find the course in database"
                })
            }
            if (user.course.some(courseId => courseId.toString() === courses[i])) {
                return res.status(200).json({
                    success: false,
                    message: "you have already purchased the course"
                })
            }
            totalAmt += purchasingCourse.price;

        } catch (error) {
            return res.json({
                success: false, message: "unable to calculate total amount to be paid, server error", error: error.message
            })
        }
    }

    const options = {
        amount: totalAmt * 100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
    }

    // create order
    try {
        const paymentResponse = await razorPayInstance.orders.create(options);
        res.json({
            success: true,
            message: paymentResponse

        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "unable to create a order , server side error"
        })
    }
}


// verify payment and enroll student inside the course
exports.verifypayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses } = req.body;
        const userId = req.user.id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required, payment failed."
            });
        }

        // Verify the payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed."
            });
        }



        // Enroll the student: Add courses to user and user to courses
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        user.course.push(...courses);

        // Update each course with the new student
        await Promise.all(
            courses.map(async (courseId) => {
                const course = await Course.findById(courseId);
                if (course) {
                    course.studentEnrolled.push(userId);
                    await course.save();
                }
            })
        );

        await user.save();

        // Send mail to the user
        await sendMail(
            user.email,
            "Payment successful, welcome to the course",
            `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; border: 1px solid #333333;">
    <div style="background: #d10000; padding: 25px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">PAYMENT CONFIRMATION</h1>
    </div>
    <div style="padding: 25px;">
        <p style="margin-bottom: 15px; line-height: 1.6;">Dear ${user.firstName + " " + user.lastName},</p>
        <p style="margin-bottom: 15px; line-height: 1.6;">We are pleased to inform you that your payment has been successfully received. The <strong style="color: #d10000;">purchased course </strong> has been added to your basket of purchases.</p>
        <p style="margin-bottom: 15px;">You can now access the course and start learning at your convenience.</p>
        <div style="text-align: center; margin: 25px 0;">
            <a href="https://example.com/access-course" 
               style="background-color: #d10000; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
               Access Your Course
            </a>
        </div>
        <p style="margin-bottom: 15px;">Thank you for choosing EDUNEST for your learning journey.</p>
        <p style="margin-top: 25px;">
            Best regards,<br>
            <span style="color: #d10000; font-weight: bold;">The EDUNEST Team</span>
        </p>
    </div>
    <div style="background: #1a1a1a; text-align: center; padding: 15px; font-size: 12px; border-top: 1px solid #333333;">
        © 2023 EDUNEST | <a href="#" style="color: #d10000; text-decoration: none;">Privacy Policy</a> | <a href="#" style="color: #d10000; text-decoration: none;">Contact Us</a>
    </div>
</div>
            `
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified and courses enrolled successfully."
        });

    } catch (error) {
        console.error("Payment verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment failed, internal server error."
        });
    }
};
