const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    //const token = req.cookies.authToken
    const token = JSON.stringify(req.headers).authToken
    if (!token) return res.json({ resultCode: 1, message: 'Access Denied' })

    try {
        req.user = jwt.verify(token, 'riopklmbascadc')
        next()
    } catch (error) {
        res.status(400).json({ resultCode: 1, message: 'Invalid Token' })
    }
}
