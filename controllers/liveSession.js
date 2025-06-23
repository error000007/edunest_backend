const LiveStream = require("../models/liveSession");
const mongoose = require("mongoose");

exports.startLiveStream = async (req, res) => {
    try {
        const { title, instructorId } = req.body;

        console.log(req.body)

        if (!title || !instructorId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!mongoose.Types.ObjectId.isValid(instructorId)) {
            return res.status(400).json({ success: false, message: "Invalid instructorId" });
        }

        const sessionId = `${instructorId}-${Date.now()}`;

        const newStream = await LiveStream.create({
            title,
            instructorId: new mongoose.Types.ObjectId(instructorId),
            sessionId,
            isActive: true,
        });

        const io = req.app.get("io");
        io.emit("new-live-stream", newStream);

        return res.status(201).json({
            success: true,
            message: "Live stream started",
            sessionId: newStream.sessionId,
        });
    } catch (error) {
        console.error("Start Live Stream Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.endLiveStream = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const stream = await LiveStream.findOneAndUpdate(
            { sessionId },
            { isActive: false, endedAt: Date.now() },
            { new: true }
        );

        if (!stream) {
            return res.status(404).json({ success: false, message: "Stream not found" });
        }

        const io = req.app.get("io");
        io.emit("stream-ended", sessionId);

        return res.status(200).json({
            success: true,
            message: "Stream ended",
        });
    } catch (error) {
        console.error("End Live Stream Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getActiveStreams = async (req, res) => {
    try {
        const activeStreams = await LiveStream.find({ isActive: true }).populate("instructorId", "name");
        res.json(activeStreams);
    } catch (error) {
        console.error("Fetch Active Streams Error:", error);
        res.status(500).json({ message: "Unable to fetch active streams" });
    }
};
