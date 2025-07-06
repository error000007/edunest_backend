// in this model all the business logic that are related to subSection are written

const Section = require('../models/Section');
const SubSection = require('../models/SubSection')
const { uploadToCloudinary } = require('../utils/cloudinaryUploader');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

// create subSection ww
exports.createSubSection = async (req, res) => {
    try {

        // fetch the data from the req.body
        const { sectionId, title, timeDuration, description } = req.body;
        const uploadedVideoFile = req.files.uploadedVideoFile;
        if (!sectionId || !title || !description || !uploadedVideoFile) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required, for creating a subsection'
            })
        }

        // upload the video to cloudinary
        const videoUrl = await uploadToCloudinary(uploadedVideoFile, "CLOUDINARY_VIDEO_FOLDER");

        // create a new subSection
        const newSubSection = await SubSection.create({
            title, timeDuration, description, videoUrl: videoUrl.secure_url
        })

        // add this subsection id to the section
        await Section.findByIdAndUpdate(sectionId, { $push: { subSection: newSubSection._id } }, { new: true });

        // return the response
        return res.status(200).json({
            success: true,
            message: 'SubSection created successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to create subSection',
            error: error.message
        })
    }
}

// update subSection ww
exports.updateSubSection = async (req, res) => {
    try {

        // fetch the data from the req.body
        const { subSectionId, title, timeDuration, description } = req.body;
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required, for updating a subsection'
            })
        }

        // fetch the subsection and update it
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: 'SubSection not found'
            })
        }

        // update the subsection
        subSection.title = title || subSection.title;
        subSection.description = description || subSection.description;
        subSection.timeDuration = timeDuration || subSection.timeDuration;
        await subSection.save();

        return res.status(200).json({
            success: true,
            message: 'SubSection updated successfully',
            subSection
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to update subSection',
            error: error.message
        })
    }
}

// delete subSection ww
exports.deleteSubSection = async (req, res) => {
    try {

        const sectionId = req.params.sectionId;
        const subSectionId = req.query.subSectionId;
        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: 'SubSection ID is required'
            })
        }


        // fetch the subsection and delete it
        const subSection = await SubSection.findByIdAndDelete(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: 'SubSection not found'
            })
        }
        const videoUrl = subSection.videoUrl;

        // delete the subsection from the section
        await Section.findByIdAndUpdate(sectionId, { $pull: { subSection: subSectionId } });

        // delete the video from the cloudinary
        if (videoUrl.includes("cloudinary.com")) {
            deleteFromCloudinary(videoUrl);
        }

        return res.status(200).json({
            success: true,
            message: 'SubSection deleted successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to delete subSection',
            error: error.message
        })
    }
}

// get all subsection to that particular section ww
exports.getAllSubSections = async (req, res) => {
    try {
        const sectionId = req.params.sectionId;
        if (!sectionId) {
            return res.json({
                success: false,
                message: 'Section ID is required'
            })
        }
        const allSubSections = await Section.findById(sectionId).select("subSection").populate({ path: "subSection" })
            .lean()
            .exec();

        if (allSubSections.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'No sections found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'All subsections retrieved successfully',
            data: allSubSections
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to retrieve all subsections',
            error: error.message
        })
    }
}

