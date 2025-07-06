// in this model all the business logic that are related to category are written

const Category = require('../models/Category');

// create category ww
exports.createCategory = async (req, res) => {
    try {

        // fetch the data from req.body
        let { name } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        name = name.toUpperCase();

        // check if the category already exists
        if (await Category.findOne({ name }).lean()) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            })
        }

        // create a new category
        await Category.create({ name });
        const allCatagory = await Category.find({}).lean();

        return res.status(200).json({
            success: true,
            message: "category created successfully",
            allCatagory
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in creating category",
            error: error.message
        })
    }
}

// get all categories  ww
exports.getAllCategory = async (req, res) => {
    try {

        // fetch data from database
        const category = await Category.find({}, { name: true })
            .select("name")
            .lean()
            .exec();

        return res.status(200).json({
            success: true,
            message: "All categories fetched successfully",
            category: category
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in getting all tags",
            error: error.message
        })
    }
}

// get all courses by category  ww
exports.getAllCouseByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required"
            });
        }

        // fetch the category and populate course details
        const category = await Category.findById(categoryId)
            .populate({
                path: "course",
                select: "name instructor description language whatYouWillLearn price thumbnail averageRating",
                populate: [
                    { path: "instructor", select: "firstName lastName image" },
                ]
            })
            .lean()
            .exec();

        if (!category || !category.course || category.course.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No course found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully by category",
            category: category
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in getting course by category",
            error: error.message
        });
    }
};

// delete catagory ww
exports.deleteCatagory = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "id is required"
            })
        }

        const catagory = await Category.findByIdAndDelete(id);
        if (!catagory) {
            return res.status(404).json({
                success: false,
                message: "category not found"
            })
        }
        return res.json({
            success: true,
            message: "Category deleted successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in deleting category,internal server error",
            error: error.message
        })
    }
}

