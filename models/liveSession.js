// models/LiveStream.js
const mongoose = require("mongoose");

const liveStreamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
});

module.exports = mongoose.model("LiveStream", liveStreamSchema);
