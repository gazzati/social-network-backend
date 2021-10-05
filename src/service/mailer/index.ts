import nodemailer from 'nodemailer'
import * as handlebars from 'handlebars'
import * as fs from 'fs'
import * as path from 'path'
import {config} from '../../config'

const getTemplate = () => {
    const filePath = path.join(__dirname, './verify-registration.html')
    const source = fs.readFileSync(filePath, 'utf-8').toString()
    return handlebars.compile(source)
}

const sendVerifyRegistration = async (name: string, email: string) => {
    const {NODEMAILER_CONFIG} = config
    const verificationCode = Math.floor(1000 + Math.random() * 9000)

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
            user: NODEMAILER_CONFIG.email,
            pass: NODEMAILER_CONFIG.password
        },
    })

    const options = {
        from: 'Gazzati Social Network',
        to: email,
        subject: 'Verify your email address',
        html: getTemplate()({name, email, verificationCode})
    }

    transporter.sendMail(options, (err, info) => {
        console.log(info)
        if (err) return console.log(err)
    })

    return verificationCode
}

export default sendVerifyRegistration