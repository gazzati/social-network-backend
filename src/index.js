const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 4000

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
    "mongodb+srv://gazzaevtimur:timur99@cluster0.xbdsh.mongodb.net/social-network?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, () =>
        console.log('Connected to db!')
)

//Middleware
app.use(express.json())
app.use('/uploads', express.static('src/uploads'))
app.use(cookieParser())
//app.use(cors({ origin: true, credentials: true }))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*')
    res.header("Access-Control-Allow-Credentials", true)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header("Access-Control-Allow-Headers", 'Authorization, Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next()
})

//Route Middlewares
app.use('/api/auth', authRoute)
app.use('/api/profile', profileRoute)
app.use('/api/users', usersRoute)
app.use('/api/chats', chatsRoute)

app.listen(PORT, () => console.log('Server Up and running'))
