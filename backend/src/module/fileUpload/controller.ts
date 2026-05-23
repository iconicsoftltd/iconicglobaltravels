import { NextFunction, Request, Response } from "express";

export const fileUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //@ts-ignore
        const file = req?.files as any;
        res.status(200).send({
            success: true,
            data: file[0]?.path
        })
    }
    catch (err) {
        next(err)
    }
}