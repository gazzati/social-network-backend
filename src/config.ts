export const config = {
    PORT: process.env.PORT || 8000,
    SOCKET_PORT: 8001,
    DB_CONNECT: 'mongodb+srv://gazzaevtimur:timur99@cluster0.xbdsh.mongodb.net/social-network?retryWrites=true&w=majority',
    TOKEN_SECRET: 'riopklmbascadc',
    CLOUDINARY_URL: 'https://res.cloudinary.com/sn-images/image/upload/',
    CLOUDINARY_CONFIG: {
        cloud_name: 'sn-images',
        api_key: '931534793846843',
        api_secret: 'VPGMr0pQdVre8-KE2LNrG3ojBZ8'
    }
}
