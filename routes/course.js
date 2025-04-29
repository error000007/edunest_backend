// in this we will write all the routes that are related to the course
const express = require('express');
const courseRouter = express.Router();

// import the controllers
const { createCourse, getCourseById, searchResult, streamVideo, getCourseDetailByAdmin, deleteCourse, getCourseByIdOverview } = require('../controllers/course')

// import the middleware
const { isAuthenticated, isInstructor, isAdmin, isStudent } = require('../middlewares/auth');

courseRouter.post('/createCourse', isAuthenticated, isInstructor, createCourse);
courseRouter.get('/getCourseById/:courseId', isAuthenticated, isStudent, getCourseById);
courseRouter.get('/searchResult/:searchData', searchResult);
courseRouter.get('/streamVideo/:videoId', isAuthenticated, isStudent, streamVideo);
courseRouter.get('/getCourseByIdOverview/:courseId', getCourseByIdOverview);
courseRouter.get('/getCourseDetailByAdmin/:courseId', isAuthenticated, isAdmin, getCourseDetailByAdmin);
courseRouter.delete('/deleteCourse/:courseId', isAuthenticated, isAdmin, deleteCourse);

module.exports = courseRouter;
