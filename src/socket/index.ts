import {createServer} from "http"
import {Server} from "socket.io"
import jwt from "jsonwebtoken"

import {JWT} from "../types/jwt"
import {config} from "../config"
import {getAllChats} from "../routes/chats"
import Chat from "../model/Chat"
import getDate from "../helper/getDate"
import { ChatType } from "types/chat"

const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["content-type"]
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

io.on("connection", socket => {
    const userSocketId = socket.id

    const token = socket.handshake.auth.token
    if(!token) return

    let userId = ''
    jwt.verify(token.toString(), config.TOKEN_SECRET || '', (err: any, decoded: any) => {
        if(err) return
        userId = (decoded as JWT)._id

    })

    if (userId) {
        if (!sessions[userId]) {
            sessions[userId] = [userSocketId]
        } else {
            sessions[userId].push(userSocketId)
        }
    }

    socket.on('loadData', async ({ chatId }) => {
        if(!userId) return
        const chats: ChatType[] = await getAllChats(userId)

        if(!chatId) {
            return socket.emit("chats", chats)
        }

        const currentChat: ChatType = chats.filter(chat => chat._id.toString() === chatId)[0]

        if(currentChat.isUnreadFor?.includes(userId)) {
            currentChat.isUnreadFor = currentChat.isUnreadFor.filter((id: any) => id.toString() !== userId)

            const chat: ChatType = await Chat.findById(chatId)
            chat.isUnreadFor = chat.isUnreadFor?.filter((id: any) => id.toString() !== userId)
            await chat.save()
        }

        const messages = currentChat.messages

        socket.emit("chats", chats)
        socket.emit("messages", messages)
    })

    socket.on('sendMessage', async ({ chatId, messageText }) => {
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

        const oldChat: ChatType = await Chat.findById(chatId)
        oldChat.isUnreadFor = oldChat.participants.filter(id => id != userId)
        await oldChat.save()

        const chats: ChatType[] = await getAllChats(userId)
        const chat: ChatType = await Chat.findById(chatId)

        socket.emit("chats", chats)
        socket.emit("messages", chat.messages)

        const companionId = chat.participants.filter(id => id != userId)[0]
        await sendToUserSockets(companionId.toString())
    })

    socket.on('startChat', async ({ companionId }) => {

        if(!userId || !companionId) return

        const newChat: ChatType = new Chat({
            participants: [userId, companionId],
            messages: []
        })
        const savedChat = await newChat.save()

        const chats: ChatType[] = await getAllChats(userId)
        const messages = chats.filter(chat => chat._id === savedChat._id)

        socket.emit("chats", chats)
        socket.emit("messages", messages)
        socket.emit("newChatId", savedChat._id)
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
