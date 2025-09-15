const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    courseName:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true
    },
    instructor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    whatYouWilllearn:{
        type: String
    },
    courseContent:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Section"
    }],
    ratingAndReviews:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview"
    }],
    price:{
        type: Number,
    },
    thumbnail:{
        type: String
    },
    tags:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Tag"
    }],
    studentEnrolled:[{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }]
})

module.exports = mongoose.model('Course', courseSchema)