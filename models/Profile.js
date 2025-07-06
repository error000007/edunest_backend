// in this collection the additional data of the user gets stored

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    dob: {
        type: String,
        trime: true
    },
    about: {
        type: String,
        trim: true
    },
    profession: {
        type: String,
        trim: true
    }
})

module.exports = mongoose.model('Profile', profileSchema)