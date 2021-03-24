import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now
    },
    info: {
        name: {
            type: String,
            required: true,
            min: 2,
            max: 255
        },
        surname: {
            type: String,
            required: true,
            min: 2,
            max: 255
        },
        aboutMe: {
            type: String
        },
        lookingForAJob: {
            type: Boolean
        },
        lookingForAJobDescription: {
            type: String
        },
        contacts: {
            facebook: {
                type: String
            },
            github: {
                type: String
            },
            instagram: {
                type: String
            },
            twitter: {
                type: String
            },
            vk: {
                type: String
            },
            youtube: {
                type: String
            }
        }
    },
    status: {
        type: String
    },
    photo: {
        url: {
            type: String
        },
        urlOriginal: {
            type: String
        },
        id: {
            type: String
        }
    },
    following: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ]
})

export default mongoose.model('User', userSchema)
