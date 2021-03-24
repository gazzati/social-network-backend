import express, { Request, Response} from 'express'
import User from '../model/Profile'
import Post from '../model/Post'
import {verify} from '../middleware/verifyToken'
import getDate from '../helper/getDate'

const router = express.Router()

const cloudinaryUrl = 'https://res.cloudinary.com/sn-images/image/upload/'
const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: 'sn-images',
    api_key: '931534793846843',
    api_secret: 'VPGMr0pQdVre8-KE2LNrG3ojBZ8'
})

//PROFILE
router.get('/:id', verify, async (req: Request, res: Response) => {
    const { id } = req.params

    //Checking if the id exists
    const user = await User.findOne({ _id: id })
    if (!user) return res.send({ resultCode: 1, message: 'User is not found' })

    const posts = await Post.find({ userId: id })

    res.send({
        resultCode: 0,
        message: 'OK',
        data: { ...user._doc, posts }
    })
})

//UPLOAD PHOTO
router.put('/photo', verify, async (req: Request, res: Response) => {
    const id = req.userId
    const file = req.files?.image

    const user = await User.findById(id)

    if (user.photo.id) {
        await cloudinary.uploader.destroy(user.photo.id,
            (error: any, result: any) => {
                console.log('Removing result', result)
            }
        )
    }

    await cloudinary.uploader.upload(file, async (err: any, result: any) => {
        if (err) res.json({ resultCode: 1, message: err })

        const formatImg = `${cloudinaryUrl}w_100,h_100,c_fill/v1612876220/${result.public_id}.${result.format}`

        await User.findByIdAndUpdate({ _id: id }, {
            photo: {
                url: formatImg,
                urlOriginal: result.url,
                id: result.public_id
            }
        })

        res.status(200).json({
            resultCode: 0,
            message: 'is Upload',
            data: {
                photo: formatImg
            }
        })
    })
})

//UPDATE INFO
router.put('/', verify, async (req: Request, res: Response) => {
    const id = req.userId

    const user = await User.findById(id)
    user.info = req.body
    user.save(async (err: any, user: any) => {
        if(err) return res.json({ resultCode: 1, message: err})

        const posts = await Post.find({ userId: id })

        res.status(200).json({
            resultCode: 0,
            message: 'Profile info was changed',
            data: { ...user._doc, posts }
        })
    })
})

//CHANGE STATUS
router.put('/status', verify, async (req: Request, res: Response) => {
    const id = req.userId
    const status = req.body.status

    if (!status) res.json({
        resultCode: 1,
        message: 'Status shouldn`t be emty'
    })

    const user = await User.findById(id)
    user.status = status
    user.save(async (err: any, user: any) => {
        if(err) return res.json({ resultCode: 1, message: err})

        res.status(200).json({
            resultCode: 0,
            message: 'Status was changed',
            data: {
                status: user.status
            }
        })
    })
})

//ADD POST
router.post('/post', verify, async (req: Request, res: Response) => {
    const id = req.userId
    const postMessage = req.body.postMessage

    if (!postMessage) res.json({
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
        res.send({ resultCode: 1, message: err })
    }
})

//ADD LIKE
router.put('/like', verify, async (req: Request, res: Response) => {
    const id = req.userId
    const postId = req.body.postId

    const post = await Post.findById(postId)
    post.likesCount++
    post.save(async (err: any) => {
        if(err) return res.json({ resultCode: 1, message: err})

        const freshPosts = await Post.find({ userId: id })

        res.status(200).json({
            resultCode: 0,
            message: 'Is liked',
            data: {
                posts: freshPosts
            }
        })
    })
})

//DELETE POST
router.delete('/post:postId', verify, async (req: Request, res: Response) => {
    const postId = req.params.postId

    await Post.deleteOne({ _id: postId }, {}, (err: any) => {
        if (err) res.send({ resultCode: 1, message: err })

        res.status(200).json({
            resultCode: 0,
            message: 'Post was deleted',
            data: {
                postId
            }
        })
    })
})

export default router
