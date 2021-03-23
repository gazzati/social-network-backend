const router = require('express').Router()
const User = require('../model/Profile')
const verify = require('./verifyToken')

//USERS
router.get('/', async (req, res) => {
    const {page, limit, term} = req.query
    const searchFilter = {'info.name': {$regex: term ? `${term}` : '.*', $options: 'i'}}

    const allUsers = await User.find(searchFilter)

    await User
        .find(searchFilter)
        .sort({date: -1})
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .exec((err, doc) => {
            if(!doc.length || err) return res.send({resultCode: 1, message: 'No find users'})

            res.send({
                resultCode: 0,
                message: 'OK',
                data: {
                    total: allUsers.length,
                    users: doc
                }

            })
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

    res.send({
        resultCode: 0,
        message: 'Follow success',
        data: {
            myId: id,
            userId: followId
        }
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

    res.send({
        resultCode: 0,
        message: 'Unfollow success',
        data: {
            myId: id,
            userId: unfollowId
        }
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
