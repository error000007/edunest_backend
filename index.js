const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
require('dotenv').config();
const cors = require("cors");

// import clodinary connection
const { cloudinaryConnection } = require('./config/cloudinaryConnection');

// import all the routes
const authRouter = require('./routes/auth');
const categoryRouter = require('./routes/category');
const courseRouter = require('./routes/course');
const dashboardRouter = require('./routes/dashboard');
const ratingAndReviewRouter = require('./routes/ratingAndReview');
const razorPayPaymentIntegrationRouter = require('./routes/razorPayPaymentIntegration');
const resetPasswordRouter = require('./routes/resetPassword');
const sectionRouter = require('./routes/section');
const subSectionRouter = require('./routes/subSection');

// import database connection
const { dataBaseConnection } = require('./config/dataBaseConnection');

const corsOptions = {
  origin: 'https://edunestedtech.vercel.app',  // Vercel frontend URL
  credentials: true,  // Allow cookies to be sent and received
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// connecting the middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// connecting the routes
app.use('/EDUNEST/api/v1/auth', authRouter);
app.use('/EDUNEST/api/v1/dashboard', dashboardRouter);
app.use('/EDUNEST/api/v1/category', categoryRouter);
app.use('/EDUNEST/api/v1/course', courseRouter);
app.use('/EDUNEST/api/v1/ratingAndReviewRouter', ratingAndReviewRouter);
app.use('/EDUNEST/api/v1/razorPayPaymentIntegrationRouter', razorPayPaymentIntegrationRouter);
app.use('/EDUNEST/api/v1/resetPasswordRouter', resetPasswordRouter);
app.use('/EDUNEST/api/v1/sectionRouter', sectionRouter);
app.use('/EDUNEST/api/v1/subSectionRouter', subSectionRouter);

// connecting the cloudinary connection
cloudinaryConnection();

// connecting the database connection
dataBaseConnection();

// connecting the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
})

// default route
app.get('/', (req, res) => {
  res.send('Server is ready to rock');
})
