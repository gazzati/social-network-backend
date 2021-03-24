import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import dotenv from 'dotenv'

//Import Routes
import authRoute from './routes/auth'
import profileRoute from './routes/profile'
import usersRoute from './routes/users'
import chatsRoute from './routes/chats'

const PORT = process.env.PORT || 4000
const DB_CONNECT = 'mongodb+srv://gazzaevtimur:timur99@cluster0.xbdsh.mongodb.net/social-network?retryWrites=true&w=majority'

dotenv.config({ path: './src/.env' })

const app = express()

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("aloha bro")
})

//Connect to DB
mongoose.connect(
    DB_CONNECT,
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
app.use('/api/chats', chatsRoute)

app.listen(PORT, () => console.log('Server Up and running'))
