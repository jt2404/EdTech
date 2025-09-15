const SubSection = require('../models/subSectionSchema')
const Section = require('../models/sectionSchema');
const { uploadImageCloudinary } = require('../utils/imageUploader');
const { default: mongoose } = require('mongoose');

require('dotenv').config()

// create subSection
exports.createSubSection = async (req, res) => {
    try {
        // fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body

        // extract file/video
        const video = req.files.videoFile;

        // validation
        if (!sectionId || !timeDuration || !title || !description || !video) {
            console.log("error", error)
            return res.status(500).json({
                success: false,
                message: "All fields are required",
            })
        }

        // upload video to cloudinary
        const uploadDetails = await uploadImageCloudinary(video, process.env.FOLDER_NAME)

        // create a sub section
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url
        })

        // update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId }, { $push: { subSection: SubSectionDetails._id } }, { new: true })

        // HW: Log updated section here, after adding populate query
        // return response
        return res.status(200).json({
            success: true,
            message: "Sub Section Created Successfully",
            updatedSection
        })

    }
    catch (error) {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: "Unable to create subsection, please try again",
            error: error.message
        })
    }
}

// update Subsection
exports.updatedSubSection = async (req, res) => {
    try {
        const { subSectionId, title, timeDuration, description } = req.body

        const video = req?.files?.videoFile;

        if (!subSectionId) {
            return res.status(402).json({
                success: false,
                message: "SectionId is required",
            })
        }

        let updateData = {}
        if (title) updateData.title = title;
        if (timeDuration) updateData.timeDuration = timeDuration;
        if (description) updateData.description = description
        if (video) {
            const uploadDetails = await uploadImageCloudinary(video, process.env.FOLDER_NAME);
            updateData.videoUrl = uploadDetails.secure_url;
        }


        const updatedSection = await mongoose.model('SubSection').findByIdAndUpdate(
            subSectionId,
            { $set: updateData },
            { new: true }
        )

        if (!updatedSection) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: updatedSection,
        });

    }
    catch (error) {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: "Unable to update subsection, please try again",
            error: error.message
        })
    }
}


// delete Subsection
exports.deleteSubSection = async (req, res) => {
    // get ID- assuming that we are sending ID in params
    const { subsectionId } = req.params

    // use findByIdandDelete
    await SubSection.findByIdAndDelete(subsectionId)

    // TODO(Testing): do we need to delete the entry from the course schema? 

    // return response
    return res.status(200).json({
        success: true,
        message: "SubSection deleted Successfully"
    })
}