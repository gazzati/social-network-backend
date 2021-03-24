import mongoose from 'mongoose'

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
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

export default mongoose.model('Post', postSchema)
