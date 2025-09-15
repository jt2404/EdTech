const Tag = require('../models/tagSchema')

// Create Tag

exports.createTag = async (req, res) => {

    try {
        const { name, description } = req.body

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // create entry in db
        const tagDetails = await Tag.create({
            name: name,
            description: description
        })

        console.log(tagDetails)

        return res.status(200).json({
            success: true,
            message: "Tag Created Successfully"
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

exports.showAllTags = async() => {
    try{

        const allTags = await Tag.find({},{name: true, description: true})

        return res.status(200).json({
            success: true,
            message: "Tag Created Successfully",
            allTags
        })
    }
    catch(error)
    {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}