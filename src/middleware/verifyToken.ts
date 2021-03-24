import { Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

import {JWT} from "../types/jwt"

const TOKEN_SECRET = 'riopklmbascadc'

export const verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authtoken as string
        if (!token) return res.json({resultCode: 1, message: 'Access Denied'})
        const payload = jwt.verify(token, TOKEN_SECRET || '') as JWT
        req.userId = payload._id
        next()
    } catch (e) {
        res.json({resultCode: 1, message: 'Invalid Token'})
    }
}
