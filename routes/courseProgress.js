const express = require("express");
const courseProgressRouter = express.Router();
const { markVideoAsCompleted, getCourseProgress, removeVideoFromCompleted } = require("../controllers/courseProgress");
// import the middleware
const { isAuthenticated, isStudent } = require('../middlewares/auth');


courseProgressRouter.post('/mark-completed', isAuthenticated, isStudent, markVideoAsCompleted);
courseProgressRouter.post('/remove-completed', isAuthenticated, isStudent, removeVideoFromCompleted);
courseProgressRouter.get('/get-progress/:courseId', isAuthenticated, isStudent, getCourseProgress);


module.exports = courseProgressRouter;
