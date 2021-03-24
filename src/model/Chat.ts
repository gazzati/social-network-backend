import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    title: {
        type: String
    },
    photo: {
        type: String
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    messages: [
        {
            text: {
                type: String,
                required: true
            },
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

export default mongoose.model('Chat', chatSchema)
