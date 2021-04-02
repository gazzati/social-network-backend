import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

import {config} from "./config"

//Import Routes
import authRoute from './routes/auth'
import profileRoute from './routes/profile'
import usersRoute from './routes/users'

import './socket'

const app = express()

//Connect to DB
mongoose.connect(
    config.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
    () => console.log('Connected to db!')
)

//Middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true }))
app.use(fileUpload({ useTempFiles: true }))

//Route Middlewares
app.use('/api/auth', authRoute)
app.use('/api/profile', profileRoute)
app.use('/api/users', usersRoute)

export const server = app.listen(config.PORT, () => console.log('Server Up and running on port:', config.PORT))

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("aloha bro")
})
