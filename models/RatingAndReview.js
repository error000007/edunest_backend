// in this the rating and the reviews of each course gets stored
const mongoose = require('mongoose');

const ratingAndReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    },
    review: {
        type: String,
        trim: true
    }

})

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema)