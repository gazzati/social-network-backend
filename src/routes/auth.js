const router = require('express').Router()
const User = require('../model/Profile')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { registerValidation, loginValidation } = require('../middleware/validation')
const verify = require('./verifyToken')

const maxAge = 24 * 60 * 60

const createToken = (id) => {
    return jwt.sign({ _id: id }, process.env.TOKEN_SECRET, { expiresIn: maxAge })
}

//ME
router.get('/me', verify, async (req, res) => {
    const userId = req.user._id

    const user = await User.findOne({ _id: userId })
    if (!user) return res.status(400).send({ resultCode: 1, message: 'User is not found' })

    res.status(200).json({
        resultCode: 0,
        message: 'OK',
        data: {
            id: user._id,
            name: user.info.name,
            surname: user.info.surname,
            photo: user.photo
        }
    })
})


//REGISTRATION
router.post('/registration', async (req, res) => {
    //LETS VALIDATE THE DATA BEFORE WE A USER
    const { error } = registerValidation(req.body)
    if (error) return res.status(400).json(error.details[0].message)

    //Checking if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).json('Email already exist')

    //Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //Create a new user
    const user = new User({
        email: req.body.email,
        password: hashedPassword,
        info: {
            name: req.body.name,
            surname: req.body.surname,
            status: ''
        },
        posts: [],
        following: [],
        followers: []
    })

    try {
        const savedUser = await user.save()

        const newUser = await User.findOne({ email: user.email })
        if (!newUser) return res.status(400).json({ resultCode: 1, message: 'Email is not found' })

        //Create a token and set cookie
        const token = createToken(newUser._id)
        //res.cookie('authToken', token, { httpOnly: true, maxAge: maxAge * 1000 })

        res.status(200).json({
            resultCode: 0,
            message: 'Registration success!',
            data: {
                userData: {
                    id: user._id,
                    name: user.info.name,
                    surname: user.info.surname,
                    photo: user.photo
                },
                authToken: token
            }
        })
        res.send({ user: user._id, resultCode: 0 })
    } catch (err) {
        res.status(400).send({ resultCode: 1, message: err })
    }
})

//LOGIN
router.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body)
    if (error) return res.status(400).json({ resultCode: 1, message: error.details[0].message })

    //Checking if the email exists
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).json({ resultCode: 1, message: 'Email is not found' })

    //Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) return res.status(400).json({ resultCode: 1, message: 'Invalid password' })

    //Create a token and set cookie
    const token = createToken(user._id)
    //res.cookie('authToken', token, { httpOnly: true, maxAge: maxAge * 1000, sameSite: 'none', secure: true })

    res.status(200).json({
        resultCode: 0,
        message: 'Logged in!',
        data: {
            userData: {
                id: user._id,
                name: user.info.name,
                surname: user.info.surname,
                photo: user.photo
            },
            authToken: token
        }
    })
})

//LOGOUT
router.delete('/logout', verify, async (req, res) => {
    res.cookie('authToken', '')
    res.status(200).json({ resultCode: 0, message: 'Succcess logout' })
})

module.exports = router
