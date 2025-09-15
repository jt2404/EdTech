const Profile = require('../models/profileSchema')
const User = require('../models/userSchema')

exports.updateProfile = async (req,res) => {
    try {
        // get data
        const {gender,dateOfBirth="",about="",contactNumber} = req.body

        // get userId
        const id = req.user.id

        if(!gender || !contactNumber)
        {
            return res.status(400).json({
                success: false,
                message: ""
            })
        }   

        const userDetails = await User.findByIdAndUpdate(id).populate("additionalDetails")

        userDetails.additionalDetails.gender = gender
        userDetails.additionalDetails.dateOfBirth = dateOfBirth
        userDetails.additionalDetails.about = about
        userDetails.additionalDetails.contactNumber = contactNumber

        userDetails.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        })

    }
    catch (error) {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        })
    }
}