const Category = require('../models/categorySchema')

// Create Category

exports.createCategory = async (req, res) => {

    try {
        const { name, description } = req.body

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description
        })

        console.log(categoryDetails)

        return res.status(200).json({
            success: true,
            message: "Category Created Successfully"
        })
    }
    catch (error) {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.showAllCategories = async () => {
    try {

        const allCategories = await Category.find({}, { name: true, description: true })

        return res.status(200).json({
            success: true,
            message: "Tag Created Successfully",
            allCategories
        })
    }
    catch (error) {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}