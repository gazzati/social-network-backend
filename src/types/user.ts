import { Document } from "mongoose"
import {PostType} from "./post";

export interface UserType extends Document {
    _id: string
    email: string
    password: string
    date: Date
    info: UserInfo
    status: string
    photo: PhotoType
    following: string[]
    followers: string[]
    posts: PostType[] | []
}

export type UserInfo = {
    name: string
    surname: string
    isMale: boolean
    aboutMe: string
    lookingForAJob: boolean
    lookingForAJobDescription: string
    contacts: ContactType[]
}

export type PhotoType = {
    id: string
    url: string
    urlOriginal: string
}

export type ContactType = {
    facebook: string
    github: string
    instagram: string
    twitter: string
    vk: string
    youtube: string
}
