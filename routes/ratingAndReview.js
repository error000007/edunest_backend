// in this file we will write all the routes that are related to the rating and review

const express = require('express');
const ratingAndReviewRouter = express.Router();

// import the controllers
const { addRatingAndReview, getAllRatingAndReviewsOfCourse, sendComment, editComment } = require('../controllers/ratingAndReview');

// import the middleware
const { isAuthenticated, isStudent } = require('../middlewares/auth');

ratingAndReviewRouter.post('/addRatingAndReview/:courseId', isAuthenticated, isStudent, addRatingAndReview);
ratingAndReviewRouter.get('/sendComment/:courseId', isAuthenticated, isStudent, sendComment);
ratingAndReviewRouter.patch('/editComment', isAuthenticated, isStudent, editComment);
ratingAndReviewRouter.get('/getAllRatingAndReviewsOfCourse/:courseId', getAllRatingAndReviewsOfCourse);

module.exports = ratingAndReviewRouter;    
