// in this collection the data of user ( Student or Teacher or Adminstrator ) is stored, that the user have inserted initially while signing up

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    accountType: {
        type: String,
        trim: true,
        enum: ["Admin", "Student", "Instructor"],
        required: true
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    },
    // courses that the user have purchased or created
    course: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],
    // for student how much the user have completed
    // for instructor how much the user have created
    portion: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portion"
    }],
    comments: [
        {
            ratingAndReview: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "RatingAndReview"
            },
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            }
        }
    ],
    cartCourse: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    earnings: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
            studentEnrolled: {
                type: Number,
                default: 0,
            },
        },
    ],

})

module.exports = mongoose.model("User", userSchema)