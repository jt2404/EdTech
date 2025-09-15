const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    otp:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        expires: 5*60
    }
})

async function sendVerificaaationEmail(email, otp) {
    try{
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion", otp)
        console.log("Email sent Sucessfully", mailResponse)
    }
    catch(error)
    {
        console.log("Error occured while sending mails", error)
        throw error;
    }
}
otpSchema.pre('save', async function (next) {
    await sendVerificaaationEmail(this.email, this.otp);
    next()
})

module.exports = mongoose.model('OTP', otpSchema)