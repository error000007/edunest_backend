// in this model all the business logic that are related to section are written

const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require('../models/SubSection')

// create section ww
exports.createSection = async (req, res) => {
    try {

        // fetch the data from the req.body
        const { courseId, name, description } = req.body;
        if (!courseId || !name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required, for section creation'
            })
        }

        let course = await Course.findById(courseId);

        // validate the course id
        if (!course) {
            return res.status(400).json({
                success: false,
                message: 'Course not found'
            })
        }

        // create a new section
        const newSection = await Section.create({ name, description });

        // insert the section to the Course model
        // Update course with the new section
        course.section.push(newSection._id);
        await course.save();

        return res.status(200).json({
            success: true,
            message: 'Section created successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to create section',
            error: error.message
        })
    }
}

// update section  ww
exports.updateSection = async (req, res) => {
    try {
        const { sectionId, name, description } = req.body;
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required, for section update'
            })
        }

        // find the section
        const section = await Section.findByIdAndUpdate(sectionId, { $set: { name, description } },
            { new: true, runValidators: true })
        if (!section) {
            return res.status(400).json({
                success: false,
                message: 'Section not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Section updated successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to update section',
            error: error.message
        })
    }
}

// delete section ww
exports.deleteSection = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const sectionId = req.query.sectionId;

        if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            })
        }

        const section = await Section.findByIdAndDelete(sectionId);
        const subSections = section.subSection;

        // delete the subSection from SubSection model
        for (i = 0; i < subSections.length; i++) {
            await SubSection.findByIdAndDelete(subSections[i]);
        }

        // delete the section from the course
        await Course.findByIdAndUpdate(courseId, { $pull: { section: sectionId } });

        return res.status(200).json({
            success: true,
            message: 'Section deleted successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to delete section',
            error: error.message
        })
    }
}

// get all sections ww
exports.getAllSection = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            })
        }

        const course = await Course.findById(courseId)
            .select('section')
            .populate({ path: "section", select: "name description" })
            .lean()
            .exec();

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            })
        }

        return res.json({
            success: true,
            sections: course.section
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error, unable to get sections',
            error: error.message
        })
    }
}
