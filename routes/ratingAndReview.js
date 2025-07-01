const express = require('express');
const {
    addRatingAndReview,
    deleteReview,
    updateReview,
    getTop10CommentsByCourse,
    getReviewByCourseAndUser,
} = require('../controllers/RatingAndReview');

const { isAuthenticated, isStudent } = require('../middlewares/auth');

const ratingRoute = express.Router();

// POST: Add a new review (requires login)
ratingRoute.post('/add', isAuthenticated, isStudent, addRatingAndReview);

// DELETE: Delete a review by reviewId and courseId (requires login)
ratingRoute.delete('/delete/:reviewId/:courseId', isAuthenticated, isStudent, deleteReview);

// PUT: Update a review by reviewId (requires login)
ratingRoute.put('/update/:reviewId', isAuthenticated, isStudent, updateReview);

// GET: Top 10 reviews for a course based on rating
ratingRoute.get('/top-comments/:courseId', getTop10CommentsByCourse);

// GET: Get a review by courseId and userId
ratingRoute.get('/review/:courseId/', isAuthenticated, isStudent, getReviewByCourseAndUser);

module.exports = ratingRoute;
