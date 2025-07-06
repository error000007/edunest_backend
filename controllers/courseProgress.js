const CourseProgress = require("../models/courseProgress");
const Course = require('../models/Course');

exports.markVideoAsCompleted = async (req, res) => {
  const { courseId, subSectionId } = req.body;
  const userId = req.user.id;

  try {
    let progress = await CourseProgress.findOne({ courseId, userId });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedVideos: [subSectionId],
      });
    } else {
      if (!progress.completedVideos.includes(subSectionId)) {
        progress.completedVideos.push(subSectionId);
        await progress.save();
      }
    }

    res.status(200).json({ success: true, message: "Video marked as completed." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark completed." });
  }
};

exports.removeVideoFromCompleted = async (req, res) => {
  const { courseId, subSectionId } = req.body;
  const userId = req.user.id;

  try {
    const progress = await CourseProgress.findOne({ courseId, userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No course progress found to update.",
      });
    }

    const index = progress.completedVideos.indexOf(subSectionId);
    if (index !== -1) {
      progress.completedVideos.splice(index, 1);
      await progress.save();
    }

    return res.status(200).json({
      success: true,
      message: "Video removed from completed list.",
    });
  } catch (error) {
    console.error("Error in removeVideoFromCompleted:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove video from completed list.",
    });
  }
};


const getTotalVideoCount = async (courseId) => {
  const course = await Course.findById(courseId).select("section.subSection");
  if (!course) return 0;

  let count = 0;
  for (const section of course.section) {
    count += section.subSection.length;
  }
  return count;
};

exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const courseProgress = await CourseProgress.findOne({ userId, courseId });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "No progress found for this course",
      });
    }

    const totalCount = await getTotalVideoCount(courseId);

    return res.status(200).json({
      success: true,
      data: {
        completed: courseProgress.completedVideos,
        completedCount: courseProgress.completedVideos.length,
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error in getCourseProgress:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching course progress",
    });
  }
};

