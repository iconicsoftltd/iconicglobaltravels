import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";

dotenv.config();

export const verifyRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Refresh token is missing. Please log in again.'
      });
    }
    try {
        const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN || "");
        req.user = verified;
        next();
    } catch (error) {
        console.log(error);
        next(
            createError.Unauthorized(`Access denied, invalid token: ${refreshToken}`)
        );
    }
};