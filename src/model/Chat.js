const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.ObjectId
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
                type: mongoose.Schema.ObjectId,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

module.exports = mongoose.model('Chat', chatSchema)
