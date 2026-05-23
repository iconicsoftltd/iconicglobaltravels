import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createToken } from "../utils/token.utils";
import bcrypt from "bcrypt";

dotenv.config();

export const verifyResendToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.body.token;

  if (!token)
    return next(createError.Unauthorized("Access denied token is required"));
  try {
    const data = jwt.verify(token, process.env.OTP_TOKEN!);
    const { exp, iat, bcryptOtp, ...payload } = data as JwtPayload;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const newBcryptOtp = await bcrypt.hash(otp, 12);

    const verifiedToken = createToken(
      { ...payload, bcryptOtp: newBcryptOtp },
      "OTP",
    );
    return res.status(201).send({
      success: true,
      statusCode: 200,
      token: verifiedToken,
    });
  } catch (error) {
    console.log(error);
    next(createError.Unauthorized(`Please Try Again`));
  }
};
