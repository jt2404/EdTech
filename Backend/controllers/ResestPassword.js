const User = require('../models/userSchema')
const mailSender = require('../utils/mailSender')
const bcrypt = require('bcrypt')

// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req body
        const { email } = req.body

        // check user for this email and check validation 
        const isExists = await User.findOne({ email: email })

        if (!isExists) {
            return res.status(400).json({
                success: false,
                message: "Your Email is not registered with us"
            })
        }

        // generate token
        const token = crypto.randomUUID()

        // update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000
            },
            {
                new: true
            }
        )

        // create url
        const url = `https:localhost:3000/update-password/${token}`

        // send mail containting url
        await mailSender(email, "Password Reset Link", "Password Reset Link", `Password Reset Link: ${url}`)

        // return response
        return res.json({
            success: true,
            message: "Email sent successfully, please check email and change pwd"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reseting the password"
        })
    }

}

// resetPassword

exports.resetPassword = async (req, res) => {
    try {
        // data fetch
        const { password, confirmPassword, token } = req.body

        // validation
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password not matching"
            })
        }

        // get user details from db using token
        const userDetails = await User.findOne({ token: token })

        // if no entry - invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is invalid"
            });
        }

        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token is expired, please regenrate your token"
            });
        }

        // hash pwd
        const hashedPassword = bcrypt.hash(password, 10)

        // password update
        await User.findOneAndUpdate({ token: token }, { password: hashedPassword }, { new: true })


        // return response
        return res.json({
            success: true,
            message: "Password reset successful"
        });
    }
    catch (error) {
        console.log("error", error)
        return res.json({
            success: false,
            message: "Something went wrong while reseting the password"
        });
    }
}