// in this model the process means the course and its completed video reference gets stored
const mongoose = require('mongoose');

const portionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    completedVideo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
        required: true
    }]
})

module.exports = mongoose.model("Portion", portionSchema)
