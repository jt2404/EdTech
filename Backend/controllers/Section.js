const Section = require('../models/sectionSchema')
const Course = require('../models/courseSchema')

exports.createSection = async (req, res) => {
    try {
        // data fetch
        const { sectionName, courseId } = req.body

        // data validation
        if (!sectionName || !courseId) {
            res.status(400).json({
                success: false,
                message: "Missing Properties"
            })
        }

        // create section
        const newSection = await Section.create({sectionName})
        
        // update course with section ObjectID
        const updatedCourse = await Course.findByIdAndUpdate(courseId,{ $push: {courseContent: newSection._id}}, {new: true})
        // ahiya uper kai rite populate karu jethi section, subsection bane ek sathe populate thai jay
        // HW: use populate to replace section / subsections both in the updatedCourseDetails

        // return response
         return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourse
        })
    }
    catch (error) {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: "Unable to create section, please try again",
            error: error.message
        })
    }
}

exports.updateSection = async(req,res) => {
    try{
        const {sectionName, sectionId} = req.body;

        if (!sectionName || !sectionId) {
            res.status(400).json({
                success: false,
                message: "Missing Properties"
            })
        }

        const section = await Section.findByIdAndUpdate(sectionId, {sectionName},{new:true})

        // return res
        return res.status(200).json({
            success: true,
            message: "Section Updated Successfully"
        })
    }
    catch(error)
    {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: "Unable to update section, please try again",
            error: error.message
        })
    }
}

exports.deleteSection = async (req,res) => {
    try{
        // get ID- assuming that we are sending ID in params
        const {sectionId} = req.params
        
        // use findByIdandDelete
        await Section.findByIdAndDelete(sectionId)

        // TODO(Testing): do we need to delete the entry from the course schema? 

        // return response
         return res.status(200).json({
            success: true,
            message: "Section deleted Successfully"
        })
    }
    catch(error)
    {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: "Unable to update section, please try again",
            error: error.message
        })
    }
}