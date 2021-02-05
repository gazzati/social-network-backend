const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

//Import Routes
const authRoute = require('./routes/auth')
const profileRoute = require('./routes/profile')
const usersRoute = require('./routes/users')
const chatsRoute = require('./routes/chats')

dotenv.config({ path: './src/.env' })

//Connect to DB
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, () =>
        console.log('Connected to db!')
)

//Middleware
app.use(express.json())
app.use('/uploads', express.static('src/uploads'))
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true }))

//Route Middlewares
app.use('/api/auth', authRoute)
app.use('/api/profile', profileRoute)
app.use('/api/users', usersRoute)
app.use('/api/chats', chatsRoute)

app.listen(4000, () => console.log('Server Up and running'))
