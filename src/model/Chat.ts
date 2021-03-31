import mongoose from 'mongoose'
import { ChatType } from 'types/chat'

const chatSchema = new mongoose.Schema<ChatType>({
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
    isUnreadFor: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    updatedAt: {
        type: Date,
        default: Date.now
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
