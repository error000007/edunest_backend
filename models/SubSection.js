// in this collection the actual video (sub-section) gets stored of each section

const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    timeDuration: {
        type: String,
        trim: true,
        default:""
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    videoUrl: {
        type: String,
        trim: true,
        required: true
    }
})

module.exports = mongoose.model("SubSection", subSectionSchema)