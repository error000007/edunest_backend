const mongoose = require('mongoose');

const StreamSchema = new mongoose.Schema({
  topic: String,
  isLive: Boolean,
  instructorId: mongoose.Schema.Types.ObjectId,
  startedAt: Date,
  endedAt: Date,
  comments: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  handRaises: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      raisedAt: Date
    }
  ]
});

module.exports = mongoose.model('Stream', StreamSchema);
