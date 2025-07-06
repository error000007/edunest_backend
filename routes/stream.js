const express = require('express');
const streamRouter = express.Router();

const {
    startStream,
    endStream,
    getLiveStreams
} = require('../controllers/streamController');
const { isAuthenticated, isInstructor } = require('../middlewares/auth');

streamRouter.post('/start', isAuthenticated, isInstructor, startStream);
streamRouter.post('/end', isAuthenticated, isInstructor, endStream);
streamRouter.get('/live', isAuthenticated, getLiveStreams);

module.exports = streamRouter;
