// in this file we will write all the routes that are related to the section

const express = require('express');
const sectionRouter = express.Router();

// import the controllers
const { createSection, updateSection, getAllSection, deleteSection } = require('../controllers/section');

// import the middleware
const { isAuthenticated, isInstructor } = require('../middlewares/auth');

sectionRouter.post('/createSection', isAuthenticated, isInstructor, createSection);
sectionRouter.patch('/updateSection', isAuthenticated, isInstructor, updateSection);
sectionRouter.get('/getAllSection/:courseId', isAuthenticated, isInstructor, getAllSection);
sectionRouter.delete('/deleteSection/:courseId', isAuthenticated, isInstructor, deleteSection);


module.exports = sectionRouter;
