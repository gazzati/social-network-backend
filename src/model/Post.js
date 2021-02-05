const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now()
    },
    message: {
        type: String,
        required: true,
        min: 1,
        max: 1024
    },
    likesCount: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('Post', postSchema)
