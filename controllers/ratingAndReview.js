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
                message: "user have already reviewed the course, you are only allowed to update your rating and reviews"
            })
        }

        const newRatingAndReview = await RatingAndReview.create({
            user: user._id,
            rating: rating,
            review: review
        })

        // add the comment to the user.comments
        user.comments.push({
            ratingAndReview: newRatingAndReview._id,
            course: courseId
        });
        await user.save();

        // update the course collection
        const course = await Course.findById(courseId)

        course.ratingAndReview.push(newRatingAndReview._id);
        const totalNewLength = course.ratingAndReview.length;
        const olderAverageRating = course.averageRating;
        const newAverageRating = (olderAverageRating * (totalNewLength - 1) + rating) / totalNewLength;
        course.averageRating = newAverageRating

        course.save();

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

// send the comment that have already made
exports.sendComment = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required.",
            });
        }

        // Populate user's comments -> ratingAndReview
        const user = await User.findById(req.user.id).populate({
            path: "comments.ratingAndReview",
            model: "RatingAndReview",
            select: "rating review createdAt updatedAt lastUpdated" // Ensure we get the date fields
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Find the comment for the given courseId
        const commentObj = user.comments.find((comment) =>
            comment.course.equals(courseId)
        );

        if (!commentObj) {
            return res.status(404).json({
                success: false,
                message: "No comment found for this course by the user.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Comment fetched successfully.",
            data: commentObj.ratingAndReview,
        });
    } catch (error) {
        console.error("Error in sendComment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching comment.",
        });
    }
};
// edit comment
exports.editComment = async (req, res) => {
    try {
        const { courseId, rating, review } = req.body;

        if (!courseId || (!rating && !review)) {
            return res.status(400).json({
                success: false,
                message: "Course ID and at least one of rating or review is required.",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Find the specific comment for this course
        const commentRef = user.comments.find((comment) =>
            comment.course.equals(courseId)
        );

        if (!commentRef) {
            return res.status(404).json({
                success: false,
                message: "No existing comment found for this course.",
            });
        }

        // Update the rating/review in RatingAndReview collection with lastUpdated
        const updatedComment = await RatingAndReview.findByIdAndUpdate(
            commentRef.ratingAndReview,
            {
                ...(rating && { rating }),
                ...(review && { review }),
                lastUpdated: Date.now() // Add this line to update the timestamp
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully.",
            data: updatedComment,
        });
    } catch (error) {
        console.error("Error in editComment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while editing comment.",
        });
    }
};



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
