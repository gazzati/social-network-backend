import express, {Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import User from '../model/Profile'
import {registerValidation, loginValidation} from '../middleware/validation'
import {verify} from '../middleware/verify-token'
import {config} from "../config"
import Profile from "../model/Profile"
import sendVerifyRegistration from "../service/mailer"

const router = express.Router()

const maxAge = 24 * 60 * 60 * 100

const createToken = (id: string) => {
    return jwt.sign({_id: id}, config.TOKEN_SECRET, {expiresIn: maxAge})
}

//ME
router.get('/me', verify, async (req: Request, res: Response) => {
    const userId = req.userId

    const user = await User.findOne({_id: userId})
    if (!user) return res.send({resultCode: 1, message: 'Please, log in'})

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
    const {name, surname, email, password, isMale} = req.body

    //LETS VALIDATE THE DATA BEFORE WE A USER
    const {error} = registerValidation(req.body)
    if (error) return res.json({resultCode: 1, message: error.details[0].message})

    //Checking if the user is already in the database
    const foundUser = await User.findOne({email})
    if (foundUser && foundUser.is_active) return res.json({resultCode: 1, message: 'Email already exist'})

    //Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const verificationCode = await sendVerifyRegistration(name, email)
    if(!verificationCode) return res.json({resultCode: 1, message: 'Verification code send error'})

    const userData = {
        email,
        password: hashedPassword,
        info: {
            name, surname, isMale,
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
        followers: [],
        verificationCode
    }



    try {
        let user
        if(foundUser) {
            // @ts-ignore
            user = await User.findOneAndUpdate({email}, userData)
        } else {
            //Create a new user
            user = new User(userData)
            await user.save()
        }

        res.status(200).json({
            resultCode: 0,
            message: `Verification code send to ${email}!`,
            data: {
                id: user._id
            }
        })
    } catch (err) {
        res.send({resultCode: 1, message: err})
    }
})

//REGISTRATION SUBMIT
router.post('/registration/submit', async (req: Request, res: Response) => {
    const {id, verificationCode} = req.body

    const user = await Profile.findById(id)

    if (!user) return res.json({resultCode: 1, message: 'User is not found'})
    if (user.verificationCode !== verificationCode) return res.json({resultCode: 1, message: 'Verification code is incorrect'})

    user.is_active = true
    user.verificationCode = ''

    try {
        await user.save()

        //Create a token and set cookie
        const token = createToken(user._id)
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
    } catch (err) {
        res.send({resultCode: 1, message: err})
    }
})

//LOGIN
router.post('/login', async (req: Request, res: Response) => {
    const {error} = loginValidation(req.body)
    if (error) return res.json({resultCode: 1, message: error.details[0].message})

    //Checking if the email exists
    const user = await User.findOne({email: req.body.email})
    if (!user) return res.json({resultCode: 1, message: 'Email is not found'})

    if (!user.is_active) return res.json({resultCode: 1, message: 'Account is not active'})

    //Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) return res.json({resultCode: 1, message: 'Invalid password'})

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
    res.status(200).json({resultCode: 0, message: 'Success logout'})
})

export default router
