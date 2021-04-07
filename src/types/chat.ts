import { Document } from "mongoose"

export interface ChatType extends Document {
    _id: string
    participants: string[]
    title?: string
    photo?: string
    isMale: boolean
    isUnreadFor?: string[]
    updatedAt: Date
    messages?: Message[]
}

export type Message = {
    text: string
    senderId: string
    date: Date
}
