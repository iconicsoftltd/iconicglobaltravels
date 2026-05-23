import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
import config from '../config';

dotenv.config();

export const createToken = (
    payload: any,
    keyType: "ACCESS" | "REFRESH"| "OTP" 
) => {
    const accessExpiresIn = (process.env.AUTH_TOKEN_EXPIRES_IN! || "15d") as jwt.SignOptions["expiresIn"];
    const refreshExpiresIn = (process.env.REFRESH_TOKEN_EXPIRES_IN! || "30d") as jwt.SignOptions["expiresIn"];
    const otpExpiresIn = (process.env.OTP_TOKEN_EXPIRES_IN! || "15m") as jwt.SignOptions["expiresIn"];
    if (keyType === "ACCESS") {
        return jwt.sign(payload, process.env.AUTH_TOKEN!, {
            expiresIn: accessExpiresIn,
        });
    } else if (keyType === "REFRESH") {
        return jwt.sign(payload, process.env.REFRESH_TOKEN!, {
            expiresIn: refreshExpiresIn,
        });
    } else if (keyType === "OTP") {
        return jwt.sign(payload, process.env.OTP_TOKEN!, {
            expiresIn: otpExpiresIn,
        });
    } 
return null;
};