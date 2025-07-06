// in this file we will write all the routes that are related to the subSection

const express = require('express');
const subSectionRouter = express.Router();

// import the controllers
const { createSubSection, updateSubSection, deleteSubSection, getAllSubSections } = require('../controllers/subSection');

// import the middleware
const { isAuthenticated, isInstructor } = require('../middlewares/auth');

subSectionRouter.post('/createSubSection', isAuthenticated, isInstructor, createSubSection);
subSectionRouter.get('/getAllSubsections/:sectionId', isAuthenticated, isInstructor, getAllSubSections);
subSectionRouter.patch('/updateSubSection', isAuthenticated, isInstructor, updateSubSection);
subSectionRouter.delete('/deleteSubSection/:sectionId', isAuthenticated, isInstructor, deleteSubSection);


module.exports = subSectionRouter;

