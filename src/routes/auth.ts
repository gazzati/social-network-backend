import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import User from '../model/Profile'
import { registerValidation, loginValidation } from '../middleware/validation'
import { verify } from '../middleware/verify-token'
import {config} from "../config"

const router = express.Router()

const maxAge = 24 * 60 * 60 * 100

const createToken = (id: string) => {
    return jwt.sign({ _id: id }, config.TOKEN_SECRET, { expiresIn: maxAge })
}

//ME
router.get('/me', verify, async (req: Request, res: Response) => {
    const userId = req.userId

    const user = await User.findOne({ _id: userId })
    if (!user) return res.send({ resultCode: 1, message: 'Please, log in' })

    res.status(200).json({
        resultCode: 0,
        message: 'OK',
        data: {
            id: user._id,
            name: user.info.name,
            surname: user.info.surname,
            photo: user.photo.url,
            isMale: user.info.isMale
        }
    })
})


//REGISTRATION
router.post('/registration', async (req: Request, res: Response) => {
    //LETS VALIDATE THE DATA BEFORE WE A USER
    const { error } = registerValidation(req.body)
    if (error) return res.json(error.details[0].message)

    //Checking if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.json('Email already exist')

    //Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //Create a new user
    const user = new User({
        email: req.body.email,
        password: hashedPassword,
        status: 'My status',
        info: {
            name: req.body.name,
            surname: req.body.surname,
            isMale: req.body.isMale,
            contacts: {
                facebook: '',
                github: '',
                instagram: '',
                twitter: '',
                vk: '',
                youtube: ''
            }
        },
        posts: [],
        following: [],
        followers: []
    })

    try {
        await user.save()

        const newUser = await User.findOne({ email: user.email })
        if (!newUser) return res.json({ resultCode: 1, message: 'Email is not found' })

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
                    photo: user.photo.url,
                    isMale: user.info.isMale
                },
                authToken: token
            }
        })
        res.send({ user: user._id, resultCode: 0 })
    } catch (err) {
        res.send({ resultCode: 1, message: err })
    }
})

//LOGIN
router.post('/login', async (req: Request, res: Response) => {
    const { error } = loginValidation(req.body)
    if (error) return res.json({ resultCode: 1, message: error.details[0].message })

    //Checking if the email exists
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.json({ resultCode: 1, message: 'Email is not found' })

    //Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) return res.json({ resultCode: 1, message: 'Invalid password' })

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
                photo: user.photo.url,
                isMale: user.info.isMale
            },
            authToken: token
        }
    })
})

//LOGOUT
router.delete('/logout', verify, async (req: Request, res: Response) => {
    res.cookie('authToken', '')
    res.status(200).json({ resultCode: 0, message: 'Success logout' })
})

export default router
