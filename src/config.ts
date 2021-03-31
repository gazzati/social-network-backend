import dotenv from 'dotenv'
dotenv.config({ path: './src/.env' })

export const config = {
    PORT: process.env.PORT || 8000,
    SOCKET_PORT: process.env.SOCKET_PORT || 8001,
    DB_CONNECT: process.env.DB_CONNECT || 'mongodb+srv://gazzaevtimur:timur99@cluster0.xbdsh.mongodb.net/social-network?retryWrites=true&w=majority',
    TOKEN_SECRET: process.env.TOKEN_SECRET || 'riopklmbascadc'
}
