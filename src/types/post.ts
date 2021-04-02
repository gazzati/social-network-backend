import { Document } from "mongoose"

export interface PostType extends Document {
    _id: string
    date: Date
    message: string
    likesCount: number
    userId: string
}
