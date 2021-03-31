import Chat from '../model/Chat'
import User from '../model/Profile'
import { ChatType } from 'types/chat'

export async function getAllChats(userId: string) {
    const chats: ChatType[] = await Chat.find({ participants: userId })

    for (const chat of chats) {
        const companionId = chat.participants.filter(id => id != userId)[0]
        const companion = await User.findById(companionId)
        chat.title = `${companion.info.name} ${companion.info.surname}`
        chat.photo = companion.photo.url
    }

    return chats.sort((a: ChatType, b: ChatType) => b.updatedAt.getTime() - a.updatedAt.getTime())
}
