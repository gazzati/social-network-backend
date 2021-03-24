import express, { Request, Response } from 'express'

import Chat from '../model/Chat'
import User from '../model/Profile'
import {verify} from '../middleware/verifyToken'
import getDate from '../helper/getDate'

const router = express.Router()

async function getAllChats(id: string = "0", res: Response, newChatId?: string) {
    const chats = await Chat.find({ participants: id })
    if (!chats) return res.send({ resultCode: 1, message: 'Chats not found' })

    for (const chat of chats) {
        if (chat.participants.length === 2) {
            const companionId = chat.participants.filter((userId: any) => userId.toString() !== id)[0]
            const companion = await User.findById(companionId)
            chat.title = `${companion.info.name} ${companion.info.surname}`
            chat.photo = companion.photo.url
        }
    }

    // @ts-ignore
    const sortedByLastMessage = [...chats].sort((a: any, b: any) => {
        if (a.messages.length && b.messages.length) {
            // @ts-ignore
            return new Date (b.messages[b.messages.length - 1].date) - new Date(a.messages[a.messages.length - 1].date)
        }
        return true
    })

    // @ts-ignore
    const newMessageSort = newChatId && [...sortedByLastMessage].sort((a, b) => b._id.toString() === newChatId.toString())
    return newChatId ? newMessageSort : sortedByLastMessage
}

//ALL CHATS
router.get('/:chatId', verify, async (req: Request, res: Response) => {
    const id = req.userId
    const chatId = req.params.chatId

    const chats = await getAllChats(id, res)

    // @ts-ignore
    const messages = chatId === 'all' ? chats[0] && chats[0].messages : chats.filter(chat => chat._id.toString() === chatId)[0].messages

    res.status(200).json({
        resultCode: 0,
        message: 'OK',
        data: {
            chats,
            messages
        }
    })
})

//START CHAT
router.put('/start/:userId', verify, async (req: Request, res: Response) => {
    const id = req.userId
    const companionId = req.params.userId

    const newChat = new Chat({
        participants: [id, companionId],
        messages: []
    })
    const savedChat = await newChat.save()

    const chats = await getAllChats(id, res, savedChat._id)
    // @ts-ignore
    const messages = chats.filter(chat => chat._id === savedChat._id)

    res.status(200).json({
        resultCode: 0,
        message: 'OK',
        data: {
            chats,
            messages,
            newChatId: savedChat._id
        }
    })
})

//SEND MESSAGE
router.post('/send:chatId', verify, async (req: Request, res: Response) => {
    const id = req.userId
    const chatId = req.params.chatId
    const messageText = req.body.text

    await Chat.findByIdAndUpdate(chatId,
        {// @ts-ignore
            $push: {
                messages: {
                    text: messageText,
                    senderId: id,
                    date: getDate()
                }
            }
        }
    )

    const chats = await getAllChats(id, res)
    const chat = await Chat.findById(chatId)

    res.status(200).json({
        resultCode: 0,
        message: 'OK',
        data: {
            chats,
            messages: chat.messages
        }
    })
})

export default router
