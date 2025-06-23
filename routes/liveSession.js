// routes/livestream.js
const express = require("express");
const liveSessionRouter = express.Router();
const { startLiveStream, endLiveStream, getActiveStreams } = require("../controllers/liveSession");

liveSessionRouter.post("/start", startLiveStream);
liveSessionRouter.post("/end", endLiveStream);
liveSessionRouter.get("/active", getActiveStreams);

module.exports = liveSessionRouter;
