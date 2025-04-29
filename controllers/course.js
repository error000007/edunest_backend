// in this controller all the business logic that are related to courses are written

const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinaryUploader');
require('dotenv').config();
const SubSection = require('../models/SubSection');
const cloudinary = require('cloudinary').v2;
const Section = require('../models/Section');
const RatingAndReview = require('../models/RatingAndReview');
const { sendMail } = require('../utils/mailSender');
// video streaming
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// create a new course ------w
exports.createCourse = async (req, res) => {
    try {

        // fetch data from req.body
        const { name, description, language, whatYouWillLearn, price, categoryId } = req.body;
        console.log(req.body)
        const thumbnail = req.files ? req.files.thumbnailImg : null;
        console.log(thumbnail)
        if (!name || !description || !language || !whatYouWillLearn || !price || !categoryId || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required, for creating the course'
            })
        }

        // validate the Category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            })
        }

        // upload the image to cloudinary
        const thumbnailImg = await uploadToCloudinary(thumbnail, "COURSE_THUMBNAIL_FOLDER");

        // upload the course to the database
        const newCourse = await Course.create({
            name,
            description,
            language,
            instructor: req.user.id,
            whatYouWillLearn,
            price,
            thumbnail: thumbnailImg.secure_url,
            category: category._id
        })

        // add this new course to the instructor's course list
        const instructor = await User.findById(req.user.id);
        instructor.course.push(newCourse._id);
        await instructor.save();

        // update the category collection
        category.course.push(newCourse._id);
        await category.save();

        // send the email to the instructor that course has been created successsfully
        try {
            await sendMail(
                instructor.email,
                "Course Created Successfully",
                `
                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #333; border-radius: 5px; background-color: #000; color: #fff;">
    <!-- Header -->
    <div style="background: #d10000; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
        <h2 style="color: #fff; margin: 0; font-size: 24px;">CONGRATULATIONS!</h2>
    </div>
    
    <!-- Content -->
    <div style="padding: 20px;">
        <p style="margin-bottom: 15px;">Your course <strong style="color: #d10000;">${name}</strong> has been created successfully.</p>
        
        <p style="margin-bottom: 10px;">Here are the details of your course:</p>
        
        <ul style="padding-left: 20px; margin-bottom: 20px;">
            <li style="margin-bottom: 8px;"><strong style="color: #d10000;">Name:</strong> ${name}</li>
            <li style="margin-bottom: 8px;"><strong style="color: #d10000;">Description:</strong> ${description}</li>
            <li style="margin-bottom: 8px;"><strong style="color: #d10000;">Language:</strong> ${language}</li>
            <li><strong style="color: #d10000;">Price:</strong> $${price}</li>
        </ul>
        
        <p style="margin-bottom: 20px;">You can now manage your course and track enrollments through your dashboard.</p>
    </div>
    
    <!-- Footer -->
    <div style="padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #333;">
        Thank you for choosing our platform to share your knowledge.<br>
        <span style="color: #d10000; font-weight: bold;">EDUNEST</span>
    </div>
</div>
                `
            );
        } catch (error) {
            console.log(error)
        }

        // return the response
        return res.status(200).json({
            success: true,
            message: 'Course created successfully',
            course_id: newCourse._id
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to create course',
            error: error.message
        })
    }
}

// get course detail complete  -----w
exports.getCourseById = async (req, res) => {
    try {

        // fetch the course id from the request body
        const courseId = req.params.courseId;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course id is required'
            })
        }

        // fetch the course details from the database
        const course = await Course.findById(courseId)
            .select("name ratingAndReview category instructor studentEnrolled section description language whatYouWillLearn price thumbnail averageRating")
            .populate({
                path: "instructor",
                select: "firstName lastName image"
            })
            .populate({
                path: "section",
                populate: {
                    path: "subSection",
                    select: "title description timeDuration"
                }
            })
            .populate({
                path: "ratingAndReview",
                options: { limit: 10 },
                populate: {
                    path: "user",
                    select: "firstName lastName image"
                }
            })
            .populate({
                path: "studentEnrolled",
                select: "firstName lastName image",
                options: { limit: 10 }
            }).exec()

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        }

        return res.status(200)
            .json({
                success: true,
                message: "Course details fetched successfully",
                data: course
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error, unable to get course details",
            error: error.message
        })
    }
}

// delete a course -----w
exports.deleteCourse = async (req, res) => {
    try {

        // only Admin has the permission to delete the course

        // fetch data from req.params
        const courseId = req.params.courseId;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course id is required"
            })
        }

        // const user = await User.findById(req.params.userId);
        // if (!user) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "User not found"
        //     })
        // }

        const course = await Course.findById(courseId).populate({ path: "section", populate: { path: "subSection" } });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        }

        // not working
        // Delete the course image from Cloudinary if it exists
        // if (course.thumbnail.includes("cloudinary.com")) {
        //     deleteFromCloudinary(course.thumbnail);
        // }

        // delete the course with section and subSection
        for (let i = 0; i < course.section.length; i++) {
            const section = course.section[i];
            for (let j = 0; j < section.subSection.length; j++) {
                const subSection = section.subSection[j];
                await SubSection.findByIdAndDelete(subSection._id);
            }
            await Section.findByIdAndDelete(section._id);
        }

        // delete the course from the database
        await Course.findByIdAndDelete(courseId);

        // remove the course from the user's course list
        // user.course = user.course.filter(course => course.toString() != courseId)
        // await user.save();

        // remove the course from the category
        const category = await Category.findById(course.category);
        category.course = category.course.filter(course => course.toString() != courseId)
        await category.save();

        // remove rating and review from the course
        for (let i = 0; i < course.ratingAndReview.length; i++) {
            await RatingAndReview.findByIdAndDelete(course.ratingAndReview[i]);
        }

        // return the response
        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error, unable to delete course",
            error: error.message
        })
    }
}

// get course detail for overview
exports.getCourseByIdOverview = async (req, res) => {
    try {

        // fetch the course id from the request body
        const courseId = req.params.courseId;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course id is required'
            })
        }

        // fetch the course details from the database
        const course = await Course.findById(courseId).select("name ratingAndReview instructor studentEnrolled section description language whatYouWillLearn price thumbnail averageRating")
            .populate({
                path: "instructor",
                select: "firstName lastName image",
            })
            .populate({
                path: "section",
                populate: {
                    path: "subSection",
                    select: "title description"
                }
            })
            .populate({
                path: "ratingAndReview",
                options: { limit: 10 },
                populate: {
                    path: "user",
                    select: "firstName lastName image"
                }
            })
            // student enrolled in this course
            .populate({
                path: "studentEnrolled",
                select: "firstName lastName image",
                options: { limit: 10 }
            })
            .exec();

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        }

        return res.status(200)
            .json({
                success: true,
                message: "Course details fetched successfully",
                data: course
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error, unable to get course details",
            error: error.message
        })
    }
}

// get course detail by admin
exports.getCourseDetailByAdmin = async (req, res) => {
    try {

        // fetch the course id from the request body
        const courseId = req.params.courseId;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course id is required'
            })
        }

        // fetch the course details from the database
        const course = await Course.findById(courseId).select("name ratingAndReview instructor studentEnrolled section description language whatYouWillLearn price thumbnail averageRating")
            .populate({
                path: "instructor",
                select: "firstName lastName image",
            })
            .populate({
                path: "section",
                populate: {
                    path: "subSection",
                    select: "title description videoUrl"
                }
            })
            .populate({
                path: "ratingAndReview",
                options: { limit: 10 },
                populate: {
                    path: "user",
                    select: "firstName lastName image"
                }
            })
            // student enrolled in this course
            .populate({
                path: "studentEnrolled",
                select: "firstName lastName image",
                options: { limit: 10 }
            })
            .exec();

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        }

        return res.status(200)
            .json({
                success: true,
                message: "Course details fetched successfully",
                data: course
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error, unable to get course details",
            error: error.message
        })
    }
}

// stream a video
exports.streamVideo = async (req, res) => {
    try {
        const { videoId } = req.params;

        // Step 1: Find the video (SubSection)
        const video = await SubSection.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found",
            });
        }

        // Step 2: Stream the video using Axios
        const videoUrl = video.videoUrl;

        // in this i have fetched the video from the link of video from (cloudinary server) 
        // in a stream way means in small chunks rather then the complete one
        const response = await axios.get(videoUrl, { responseType: 'stream' });

        // inserting the header insidet the response 
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", `inline; filename=${videoId}.mp4`);
        res.setHeader("Cache-Control", "no-cache");

        // the actual video data gets stored in response.data so make it a pipe and send it in response
        // so in this in real time the video smll chunk data fetched from cloudinary stored in server and forwarded to frontend
        // so the connection is still on till video is streaming 
        response.data.pipe(res);

    } catch (error) {
        console.error("Error streaming video:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to stream video",
            error: error.message,
        });
    }
};

// showing the result for the searched courses
exports.searchResult = async (req, res) => {
    try {
        let data = req.params.searchData;
        data = data.replace("_", " ")
        if (!data) {
            return res.json({
                success: false,
                message: "data is not there"
            })
        }

        // find the courses based on the search result
        let courses = await Course.find({})
            .select("name description language price thumbnail averageRating")
            .exec();
        courses = courses.filter(value => {
            if (!value?.description) return false;

            // Normalize both strings for better matching
            const normalize = (str) =>
                String(str)
                    .normalize("NFD") // decompose accented characters
                    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
                    .toLowerCase()
                    .trim();

            const searchText = normalize(data);
            const descriptionText = normalize(value.description);

            return descriptionText.includes(searchText);
        });

        return res.json({
            success: true,
            message: "data fetched successfully",
            searchResult: courses
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to find search result",
            error: error.message,
        });
    }
}