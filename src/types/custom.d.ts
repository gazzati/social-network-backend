import express from "express"

declare module "express" {
    export interface Request extends express.Request {
        userId?: string
    }
}
