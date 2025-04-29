// in this file we will write all the routes that are related to the category

const express = require('express');
const categoryRouter = express.Router();

// import the controllers
const { createCategory, getAllCategory, getAllCouseByCategory,deleteCatagory } = require('../controllers/category');

// import the middleware
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

categoryRouter.post('/createCategory', isAuthenticated, isAdmin, createCategory);
categoryRouter.delete('/deleteCategory/:id', isAuthenticated, isAdmin, deleteCatagory);
categoryRouter.get('/getAllCategory', getAllCategory);
categoryRouter.get('/getAllCouseByCategory/:categoryId', getAllCouseByCategory);

module.exports = categoryRouter;
