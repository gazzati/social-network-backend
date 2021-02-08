const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')
const app = express()

const PORT = process.env.PORT || 4000
const DB_CONNECT = 'mongodb+srv://gazzaevtimur:timur99@cluster0.xbdsh.mongodb.net/social-network?retryWrites=true&w=majority'

//Import Routes
const authRoute = require('./routes/auth')
const profileRoute = require('./routes/profile')
const usersRoute = require('./routes/users')
const chatsRoute = require('./routes/chats')

dotenv.config({ path: './src/.env' })

app.get("/", (req, res) => {
    res.send("aloha")
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
