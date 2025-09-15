const bcrypt = require('bcrypt')
const User = require('../models/userSchema')
const OTP = require('../models/otpSchema')
const otpGenerator = require('otp-generator')
const Profile = require('../models/profileSchema')
const JWT = require('jsonwebtoken')
const mailSender = require('../utils/mailSender')

require('dotenv').config()

exports.sendOTP = async (req, res) => {
    try {

        // fetch email  from request ki body
        const { email } = req.body

        // check if user already exist
        const checkUserPresent = User.findOne({ email })

        // if user already exist, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered"
            })
        }
        // generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        console.log("OTP generated: ", otp)

        // check unique otp or not
        const result = await OTP.findOne({ otp: otp })

        // This is brute force approach. It is a worst approach. db call in loop.
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })
            result = await OTP.findOne({ otp: otp })
        }
        const otpPayload = { email, otp }

        // create an entry for OTP
        const otpBody = await OTP.create(otpPayload)
        console.log(otpBody)

        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp
        })

    }
    catch (err) {
        console.log("err", err)
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }


}

// signup

exports.signup = async (req, res) => {
    try {

        // data fetch from request ki body

        const { firstName, lastName, email, password, confirmPassword, accountType, otp } = req.body

        // validate karlo

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        // 2 password match kar lo
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and ConfirmPassword value does not match, please try again"
            })
        }

        // check user already exist or not
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered"
            })
        }
        // find most recent recent OTP stored for the user 
        const mostRecentOTP = await OTP.find({ email: email }).sort({ createdAt: -1 }).limit(1)
        console.log(mostRecentOTP)

        // validate OTP
        if (mostRecentOTP.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        }
        else if (otp != mostRecentOTP.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is wrong"
            })
        }

        // hashed the password 
        const hashedPassword = await bcrypt.hash(password, 10)

        const profileDetails = Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        // entry create in db
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        // return res

        return res.status(201).json({
            success: true,
            message: "User is registered Successfully",
            user
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again."
        })
    }

}

exports.login = async (req, res) => {

    try {

        // get data from req body
        const { email, password } = req.body

        //validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        // user check exist or not
        const user = await User.findOne({ email }).populate("additionalDetails")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first"
            })
        }
        // generate JWT, after password match
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = JWT.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            })
            user.token = token
            user.password = undefined

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            })
        }

        // create cookie and send response 
    }
    catch (error) {
        console.log("error", error)
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again"
        })
    }
}

// changePassword

async function sendPasswordUpdationEmail(email) {
    try{
        const mailResponse = await mailSender(email, "Your  Password Updated Successfully", "")
        console.log("Email sent Sucessfully", mailResponse)
    }
    catch(error)
    {
        console.log("Error occured while sending mails", error)
        throw error;
    }
}

exports.changePassword = async (req, res) => {
    // get data from req body
    const { email, oldPassowrd, newPassword, confirmPassword } = req.body

     // get oldPassowrd, newPassword, confirmPassword
    if (!email || !oldPassowrd || !newPassword || !confirmPassword) {
        return res.status(403).json({
            success: false,
            message: "All fields are required"
        })
    }

    // validation
    if (newPassword != confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Password and ConfirmPassword value does not match, please try again"
        })
    }

    // update password in DB
    const user = User.findOne(email)

    if(!user)
    {
         return res.status(404).json({
            success: false,
            message: "User is not registered, please signup first"
        })
    }

    const isMatch = await bcrypt.compare(oldPassowrd, user.password)

    if(!isMatch)
    {
         return res.status(404).json({
            success: false,
            message: "Current Password is incorrect"
        })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword;

    // send mail - Password Updated
    await sendPasswordUpdationEmail(email)

    await user.save()

    // return response
    return res.status(200).json({
        success: true,
        message: "Password updated successfully"
    })
    
}
