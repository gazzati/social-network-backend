const router = require('express').Router()
const User = require('../model/Profile')
const Post = require('../model/Post')
const verify = require('./verifyToken')

const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const getDate = require('../helper/getDate')

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    //reject a file
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb('Please upload only images.', false)
    }
}

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5     //5 Mb
    },
    fileFilter
})

function removeOld(id) {
    const files = fs.readdirSync('./src/uploads/')

    for (let i = 0; i < files.length; i++) {
        const filename = path.join('./src/uploads/', files[i])
        if (filename.includes(id)) {
            fs.unlinkSync(filename)
        }
    }
}

//PROFILE
router.get('/:id', verify, async (req, res) => {
    const { id } = req.params

    //Checking if the id exists
    const user = await User.findOne({ _id: id })
    if (!user) return res.status(400).send({ resultCode: 1, message: 'User is not found' })

    const posts = await Post.find({ userId: id })

    res.send({
        resultCode: 0,
        message: 'OK',
        data: {...user._doc, posts}
    })
})

//UPLOAD PHOTO
router.put('/photo', verify, upload.single('image'), async (req, res) => {

    const id = req.user._id
    const filename = `${id}-${new Date().getTime()}.${req.file.mimetype.slice(6)}`

    removeOld(id)

    await sharp(req.file.buffer)
        .resize(100, 100)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile('./src/uploads/' + filename)

    const user = await User.findByIdAndUpdate({ _id: id }, {
        photo: `http://localhost:4000/uploads/${filename}`
    })

    res.status(200).json({
        resultCode: 0,
        message: 'is Upload',
        data: {
            photo: `http://localhost:4000/uploads/${filename}`
        }
    })
})

//UPDATE INFO
router.put('/', verify, async (req, res) => {

    const id = req.user._id

    const user = await User.findByIdAndUpdate({ _id: id })
    user.info = req.body
    user.save()

    res.status(200).json({
        resultCode: 0,
        message: 'Profile info was changed',
        data: user
    })
})

//CHANGE STATUS
router.put('/status', verify, async (req, res) => {

    const id = req.user._id
    const status = req.body.status

    if (!status) res.status(400).json({
        resultCode: 1,
        message: 'Status shouldn`t be emty'
    })

    const user = await User.findByIdAndUpdate({ _id: id })
    user.status = status
    user.save()

    res.status(200).json({
        resultCode: 0,
        message: 'Status was changed',
        data: {
            status: user.status
        }
    })
})

//ADD POST
router.post('/post', verify, async (req, res) => {

    const id = req.user._id
    const postMessage = req.body.postMessage

    if (!postMessage) res.status(400).json({
        resultCode: 1,
        message: 'Post message shouldn`t be empty'
    })

    const post = new Post({
        message: postMessage,
        userId: id,
        date: getDate()
    })

    try {
        await post.save()
        const freshPosts = await Post.find({ userId: id })

        res.status(200).json({
            resultCode: 0,
            message: 'Post was added',
            data: {
                posts: freshPosts
            }
        })
    } catch (err) {
        res.status(400).send({ resultCode: 1, message: err })
    }
})

//ADD LIKE
router.put('/like', verify, async (req, res) => {

    const id = req.user._id
    const postId = req.body.postId

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } })
    const freshPosts = await Post.find({ userId: id })

    res.status(200).json({
        resultCode: 0,
        message: 'Is liked',
        data: {
            posts: freshPosts
        }
    })
})

//DELETE POST
router.delete('/post:postId', verify, async (req, res) => {

    const postId = req.params.postId

    await Post.deleteOne({ _id: postId },(err) => {
        if(err) res.status(400).send({ resultCode: 1, message: err })

        res.status(200).json({
            resultCode: 0,
            message: 'Post was deleted',
            data: {
                postId
            }
        })
    })
})

module.exports = router
