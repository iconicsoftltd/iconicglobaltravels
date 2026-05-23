import prisma from "../../utils/prisma";
import { Request, Response } from "express";

export const getTestUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findMany();
  res.json({ message: "Test user fetched successfully", data: user });
};
