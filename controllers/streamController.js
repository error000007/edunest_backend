const Stream = require('../models/Stream');

exports.startStream = async (req, res) => {
  try {
    const stream = await Stream.create({
      topic: req.body.topic,
      instructorId: req.body.instructorId,
      isLive: true,
      startedAt: new Date()
    });
    res.status(201).json(stream);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start stream' });
  }
};

exports.endStream = async (req, res) => {
  try {
    const stream = await Stream.findByIdAndUpdate(
      req.params.id,
      { isLive: false, endedAt: new Date() },
      { new: true }
    );
    res.status(200).json(stream);
  } catch (err) {
    res.status(500).json({ error: 'Failed to end stream' });
  }
};

exports.getLiveStreams = async (req, res) => {
  try {
    const streams = await Stream.find({ isLive: true });
    res.status(200).json(streams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
};
