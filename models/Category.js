// in this collection the categories and their related courses are present

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    course: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }]
})

module.exports = mongoose.model("Category", categorySchema)