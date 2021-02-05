const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    const token = req.cookies.authToken
    if (!token) return res.json({ resultCode: 1, message: 'Access Denied' })

    try {
        req.user = jwt.verify(token, process.env.TOKEN_SECRET)
        next()
    } catch (error) {
        res.status(400).json({ resultCode: 1, message: 'Invalid Token' })
    }
}
