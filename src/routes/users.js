const router = require('express').Router()
const User = require('../model/Profile')
const verify = require('./verifyToken')

//USERS
router.get('/',async (req, res) => {
    const term = req.query.term

    const users = await User.find({
        'info.name': { $regex: term ? `${term}` : '.*', $options: 'i' }
    })

    res.send({
        resultCode: 0,
        message: 'OK',
        data: users.reverse()
    })
})

//FOLLOW
router.post('/follow:id', verify, async (req, res) => {
    const id = req.user._id
    const followId = req.params.id

    const followUser = await User.findById(followId)
    followUser.followers.push(id)
    followUser.save()

    const currentUser = await User.findById(id)
    currentUser.following.push(followId)
    currentUser.save()

    const users = await User.find()

    res.send({
        resultCode: 0,
        message: 'Follow success',
        data: users
    })
})

//UNFOLLOW
router.delete('/unfollow:id', verify, async (req, res) => {
    const id = req.user._id
    const unfollowId = req.params.id

    const unfollowUser = await User.findById(unfollowId)
    unfollowUser.followers = unfollowUser.followers.filter(followerId => followerId.toString() !== id)
    unfollowUser.save()

    const currentUser = await User.findById(id)
    currentUser.following = currentUser.following.filter(followerId => followerId.toString() !== unfollowId)
    currentUser.save()

    const users = await User.find()

    res.send({
        resultCode: 0,
        message: 'Unfollow success',
        data: users
    })
})

//FOLLOWING
router.get('/following', verify, async (req, res) => {
    const id = req.user._id
    const currentUser = await User.findById(id)
    const following = []

    for (const followingId of currentUser.following) {
        const followingUser = await User.findById(followingId)
        following.push(followingUser)
    }

    res.send({
        resultCode: 0,
        message: 'OK',
        data: following
    })
})

//FOLLOWERS
router.get('/followers', verify, async (req, res) => {
    const id = req.user._id
    const currentUser = await User.findById(id)
    const followers = []

    for (const followerId of currentUser.followers) {
        const follower = await User.findById(followerId)
        followers.push(follower)
    }

    res.send({
        resultCode: 0,
        message: 'OK',
        data: followers
    })
})

module.exports = router
