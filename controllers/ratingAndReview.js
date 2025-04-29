const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const User = require('../models/User');

// add rating and review ----w
exports.addRatingAndReview = async (req, res) => {
    try {

        // fetch the data
        const { courseId, rating, review } = req.body;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course id is required"
            })
        }

        // find the user from the database
        const user = await User.findById(req.user.id)

        // verify that user is enrolled inside the course or not
        if (!user.course.includes(courseId)) {
            return res.status(404).json({
                success: false,
                message: "user is not authorized for rating and review, first purchase the course"
            })
        }

        // check whether the user have already commented on it
        if (await RatingAndReview.findOne({ user: user._id })) {
            return res.status(404).json({
                success: false,
                message: "user have already reviewed the course, you are only allowed to update your review"
            })
        }

        const newRatingAndReview = await RatingAndReview.create({
            user: user._id,
            rating: rating,
            review: review
        })


        // update the course collection
        const course = await Course.findById(courseId)
        const existingReviewsCount = course.ratingAndReview.length;
        console.log(typeof existingReviewsCount)
        const currentAverage = course.averageRating || 0;
        console.log(typeof currentAverage)

        // formula for updating average rating
        const newAverage =
            (Number(currentAverage) * Number(existingReviewsCount) + Number(rating)) /
            (Number(existingReviewsCount) + 1)
            ; console.log(typeof newAverage)
        course.averageRating = newAverage;
        course.ratingAndReview.push(newRatingAndReview._id)
        await course.save()

        return res.status(200).json({
            success: true,
            message: "Rating and review added successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error, unable to add rating and review"
        })

    }
}

// get all rating and reviews of the course  ------
exports.getAllRatingAndReviewsOfCourse = async (req, res) => {
    try {

        const courseId = req.params.courseId;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course id is required"
            })
        }

        const course = await Course.findById(courseId)
            .select("ratingAndReviews")
            .populate({
                path: "ratingAndReview",
                options: { limit: 20 },
                populate: { path: "user", select: "firstname lastName image" }
            })
            .exec();

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        }

        course.ratingAndReview.sort((a, b) => b.rating - a.rating);

        return res.status(200).json({
            success: true,
            message: "All rating and reviews fetched successfully",
            allRatingAndReviews: course.ratingAndReview
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error, unable to get all rating and reviews of the given course"
        })
    }
}
