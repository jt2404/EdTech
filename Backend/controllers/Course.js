const Course = require('../models/courseSchema')
const Tag = require('../models/tagSchema')
const User = require('../models/userSchema')

const { uploadImageCloudinary } = require('../utils/imageUploader')

// createCourse handler function
exports.createCourse = async (req, res) => {

    try {

        // fetch data
        const { courseName, description, whatYouWilllearn, price, tag } = req.body

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        if (!courseName || !description || !whatYouWilllearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // check for instructor 
        const userId = req.user.id;

        // const instructorDetails = await User.findById(userId)

        // console.log(instructorDetails)
        // if (!instructorDetails) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "Instructor Details not found "
        //     })
        // }

        const tagDetails = await Tag.findById(tag)

        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag Details not found "
            })
        }

        // upload Image top Cloudinary
        const thumbnailImage = await uploadImageCloudinary(thumbnail, process.env.FOLDER_NAME)

        // create an entryfor new Course
        const newCourse = await Course.create({
            courseName,
            description,
            instructor: userId,
            whatYouWilllearn,
            price,
            thumbnail: thumbnailImage.secure_url,
            tag: tagDetails._id
        })

        // add the new course to the user schema of Instructor
        await User.findByIdAndUpdate({ _id: userId }, { $push: { courses: newCourse._id } }, { new: true })

        // Update ka schema 
        await Tag.findByIdAndUpdate({ _id: tag }, { $push: { course: newCourse._id } }, { new: true })

        // return response
        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse
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

// getAllCourse handler function

exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, { courseName: true, price: true, thumbnail: true, instructor: true, ratingAndReviews: true, studentEnrolled: true })
            .populate("instructor")

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses
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