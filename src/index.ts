import {createServer} from "http"
import {Server} from "socket.io"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

import {JWT} from "./types/jwt"
import {config} from "./config"
import Chat from "./model/Chat"
import getDate from "./helper/getDate"
import compareDates from "./helper/comporeDates"
import {ChatType} from "types/chat"
import User from "./model/Profile"
import {UserType} from "./types/user"

//Connect to DB
mongoose.connect(
    config.DB_CONNECT,
    {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false},
    () => console.log('Connected to db!')
)

const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
})

export type Sessions = {
    [userId: string]: Array<string>
}

const sessions: Sessions = {}

export const sendToUserSockets = async (id: string) => {
    if (sessions[id] != undefined) {
        const chats: ChatType[] = await getAllChats(id)

        sessions[id].forEach(i => {
            io.sockets.to(i).emit("chats", chats)
        })
    }
}

export const getAllChats = async (userId: string) => {
    const chats = await Chat.find({participants: userId}) as ChatType[]

    for (const chat of chats) {
        const companionId = chat.participants.filter(id => id != userId)[0]
        const companion = await User.findById(companionId) as UserType
        chat.title = `${companion.info.name} ${companion.info.surname}`
        chat.photo = companion.photo.url
        chat.isMale = companion.info.isMale
    }

    return chats.sort(compareDates)
}

io.on("connection", socket => {
    const userSocketId = socket.id

    const token = socket.handshake.auth.token
    if (!token) return

    let userId = ''
    jwt.verify(token.toString(), config.TOKEN_SECRET || '', (err: any, decoded: any) => {
        if (err) return
        userId = (decoded as JWT)._id

    })

    if (userId) {
        if (!sessions[userId]) {
            sessions[userId] = [userSocketId]
        } else {
            sessions[userId].push(userSocketId)
        }
    }

    socket.on('loadData', async ({chatId}) => { // ToDo fix chatId may be userId
        if (!userId) return
        const chats: ChatType[] = await getAllChats(userId)
        const foundedCurrentChat = chats.filter(chat => chat._id.toString() === chatId)[0]

        if (chatId && !foundedCurrentChat) {
            const newChat: ChatType = new Chat({
                participants: [userId, chatId],
                messages: []
            })
            const savedChat = await newChat.save()

            const chats: ChatType[] = await getAllChats(userId)
            const messages = chats.filter(chat => chat._id === savedChat._id)

            socket.emit("chats", chats)
            socket.emit("messages", messages)
            socket.emit("newChatId", savedChat._id)
            return
        }

        const currentChat: ChatType = chatId ? foundedCurrentChat : chats[0]

        if (currentChat.isUnreadFor?.includes(userId)) {
            currentChat.isUnreadFor = currentChat.isUnreadFor.filter((id: any) => id.toString() !== userId)

            const chat = await Chat.findById(currentChat._id) as ChatType
            chat.isUnreadFor = chat.isUnreadFor?.filter((id: any) => id.toString() !== userId)
            await chat.save()
        }

        const messages = currentChat.messages

        socket.emit("chats", chats)
        socket.emit("messages", messages)
    })

    socket.on('sendMessage', async ({chatId, messageText}) => {
        await Chat.findByIdAndUpdate(chatId,
            {// @ts-ignore
                $push: {
                    messages: {
                        text: messageText,
                        senderId: userId,
                        date: getDate()
                    }
                }
            }
        )

        const oldChat = await Chat.findById(chatId) as ChatType
        oldChat.isUnreadFor = oldChat.participants.filter(id => id != userId)
        oldChat.updatedAt = new Date()
        await oldChat.save()

        const chats = await getAllChats(userId) as ChatType[]
        const chat = await Chat.findById(chatId) as ChatType

        socket.emit("chats", chats)
        socket.emit("messages", chat.messages)

        const companionId = chat.participants.filter(id => id != userId)[0]
        await sendToUserSockets(companionId.toString())
    })

    socket.on("disconnect", () => {
        Object.keys(sessions).forEach(userId => {
            if (sessions[userId]?.includes(userSocketId)) {
                sessions[userId] = sessions[userId].filter(id => id !== userSocketId)
                if (!sessions[userId].length) {
                    delete sessions[userId]
                }
            }
        })
    })
})

httpServer.listen(config.SOCKET_PORT, () => console.log('Socket running on port:', config.SOCKET_PORT))
