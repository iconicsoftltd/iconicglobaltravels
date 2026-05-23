import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'

dotenv.config()

export const verifyOtpToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    const token = req.body.token;
    const bodyPassword = req.body.password;

    if (!token) return next(createError.Unauthorized('Access denied token is required'))
    try {
        const data = jwt.verify(token, process.env.OTP_TOKEN!)
        const {id, bcryptOtp, name, email, phone, password } = data as {id: number, bcryptOtp: string, name: string, email: string, password: string, phone: string };
        req.body.phone = phone;
        req.body.id = id;
        req.body.verified = true;
        req.body.name = name;
        req.body.email = email;
        req.body.password = bodyPassword || password;
        req.body.bcryptOtp = bcryptOtp
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ success: false, statusCode: 400, message: "Please Try Again" });
    }
}
