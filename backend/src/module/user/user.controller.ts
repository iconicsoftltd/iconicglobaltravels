import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import config from "../../config";
import prisma from "../../utils/prisma";
import sendMail from "../../utils/sendEmail";
import { createToken } from "../../utils/token.utils";
import { IUserUpdate } from "./user.validation";

const randomOrderId = async () => {
  while (true) {
    const verifiedCode = Math.floor(
      10000000 + Math.random() * 90000000,
    ).toString();

    const existingOrder = await prisma.user.findFirst({
      where: { verifiedCode },
    });

    if (!existingOrder) {
      return verifiedCode;
    }
  }
};

// create User variation
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const password = req.body.password;
    const findUser = await prisma.user.findFirst({
      where: req.body,
    });
    if (findUser) {
      return res.status(400).send({
        success: false,
        message: "User Already Exist",
      });
    }
    req.body.password = await bcrypt.hash(password, 10);
    req.body.verifiedCode = await randomOrderId();
    // Create User
    const result = await prisma.user.create({
      data: req.body,
      include: {
        employee: true,
      },
    });
    const email = result.employee.email;
    const message = `Your account has been created successfully.
        Your Email: ${email},
        Your Password: ${password}.
Please use the following verification url to verify your account: ${config.clientUrl}/verify-account?code=${result.verifiedCode}
`;
    await sendMail({ email, message, subject: "Account Verification" });

    await prisma.userLog.create({
      data: {
        branchId: result.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        userId: result.id,
        data: result,
        action: "CREATED",
      },
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "User Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@");
  const visiblePart = localPart.slice(0, 2);
  return `${visiblePart}***@${domain}`;
};

export default maskEmail;

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        employee: {
          email,
          branch: {
            isActive: true,
          },
        },
        isActive: true,
      },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
        permissions: { include: { permission: true } },
        branches: { include: { branch: true } },
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: `Account not verified. Please Check your email (${maskEmail(user.employee.email)}) for verification link.`,
      });
    }

    if (!user.branches || user.branches.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No branch assigned to this user.",
      });
    }

    // 🧱 Step 1: Role-based permissions
    const rolePermissions = user.role.rolePermissions.map((rp) => ({
      id: rp.permission.id,
      module: rp.permission.module,
      action: rp.permission.action,
      isAllowed: rp.isAllowed,
    }));

    // 🧱 Step 2: User-specific permissions
    const userPermissions = user.permissions.map((up) => ({
      id: up.permission.id,
      module: up.permission.module,
      action: up.permission.action,
      isAllowed: up.isAllowed,
    }));

    // 🧱 Step 3: Merge Permissions (User permission overrides Role)
    const finalPermissions = new Map<
      string,
      { id: number; module: string; action: string; isAllowed: boolean }
    >();

    // Base Role Permissions
    for (const rp of rolePermissions) {
      finalPermissions.set(`${rp.module}_${rp.action}`, {
        id: rp.id,
        module: rp.module,
        action: rp.action,
        isAllowed: rp.isAllowed,
      });
    }

    // Override with User Permissions
    for (const up of userPermissions) {
      finalPermissions.set(`${up.module}_${up.action}`, {
        id: up.id,
        module: up.module,
        action: up.action,
        isAllowed: up.isAllowed,
      });
    }

    // 🧱 Step 4: Convert Map to Array
    const mergedPermissions = Array.from(finalPermissions.values());

    // 🧱 Step 5: Branch List
    const branches = user.branches.map((b) => ({
      id: b.branch.id,
      name: b.branch.name,
      address: b.branch.address,
    }));

    // 🧱 Step 6: JWT Payload
    const jwtPayload = {
      id: user.id,
      name: user.employee.name,
      image: user.employee.image,
      email: user.employee.email,
      designation: user.employee.designation,
      department: user.employee.department,
      phone: user.employee.phone,
      userId: user.id,
      employeeId: user.employeeId,
      branchId: user.employee.branchId,
      role: user.role.name,
      branches,
    };

    // 🧱 Step 7: Generate Token
    const token = createToken(jwtPayload, "ACCESS");

    await prisma.userLog.create({
      data: {
        branchId: user.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: user.id,
        userId: user.id,
        data: user,
        action: "LOGIN_USER",
      },
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.employee.name,
        email: user.employee.email,
        role: user.role.name,
        branches,
        permissions: mergedPermissions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, search } = req.query;
    if (!req.query.branchId) {
      return res
        .status(400)
        .json({ status: false, message: "Branch id is required" });
    }
    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;

    const branchId = Number(req.query.branchId);

    const whereCondition: Prisma.UserWhereInput[] = [];
    if (skip < 0) {
      skip = 0;
    }
    if (search) {
      whereCondition.push({
        OR: [{ employee: { name: { contains: search as string } } }],
      });
    }

    const result = await prisma.user.findMany({
      where: {
        employee: {
          branchId: branchId,
        },
        AND: whereCondition,
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
          },
        },
      },
      skip: skip * take,
      take,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.user.count({
      where: {
        employee: {
          branchId: Number(branchId),
        },
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User retrieved successfully",
      meta: {
        page: page,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get User by id
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const UserId = Number(req.params.id);

    if (!UserId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User ID is missing in the request parameters",
      });
    }

    const result = await prisma.user.findFirst({
      where: {
        id: UserId,
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
export const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = req.params as { code: string };

    if (!code) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "verification code is missing in the request parameters",
      });
    }

    const result = await prisma.user.findFirst({
      where: {
        verifiedCode: code,
      },
      include: {
        employee: true,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }
    await prisma.user.update({
      where: {
        id: result.id,
      },
      data: {
        isVerified: true,
        verifiedCode: null,
      },
    });

    await prisma.userLog.create({
      data: {
        branchId: result.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: result.id,
        userId: result.id,
        data: result,
        action: "VERIFY_ACCOUNT",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User verified successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
export const sendVerifyLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.params as { email: string };

    if (!email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "email is missing in the request parameters",
      });
    }

    const result = await prisma.user.findFirst({
      where: {
        employee: {
          email: email,
        },
      },
      include: {
        employee: true,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    if (result.isVerified) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Your account is already verified please login to continue",
      });
    }
    const message = `Your account has been created successfully.
Please use the following verification url to verify your account: ${config.clientUrl}/verify-account?code=${result.verifiedCode}
`;
    await sendMail({ email, message, subject: "Account Verification" });

    await prisma.userLog.create({
      data: {
        branchId: result.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: result.id,
        userId: result.id,
        data: result,
        action: "SEND_VERIFY_LINK",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `verification link has been sent successfully to your email ${maskEmail(email)}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
export const sendForgetLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.params as { email: string };

    if (!email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "email is missing in the request parameters",
      });
    }

    const result = await prisma.user.findFirst({
      where: {
        employee: {
          email: email,
        },
      },
      include: {
        employee: true,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    if (!result.isVerified) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message:
          "Your account is not verified yet please verify your account to continue",
      });
    }
    const forgetCode = await randomOrderId();
    await prisma.user.update({
      where: {
        id: result.id,
      },
      data: {
        verifiedCode: forgetCode,
      },
    });
    const message = `Your account forget link has been created successfully.
Please use the following url to forget password: ${config.clientUrl}/forget-password?code=${forgetCode}
`;
    await sendMail({ email, message, subject: "Forget Password" });

    await prisma.userLog.create({
      data: {
        branchId: result.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: result.id,
        userId: result.id,
        data: result,
        action: "SEND_FORGET_LINK",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Forget password link has been sent successfully to your email ${maskEmail(email)}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// update User
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const UserId = Number(req.params.id);
    const data = req.body as IUserUpdate;

    if (!UserId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User ID is missing in the request parameters",
      });
    }

    if (data?.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: UserId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    const result = await prisma.user.update({
      where: {
        id: UserId,
      },
      data: data,
      include: {
        employee: true,
      },
    });

    await prisma.userLog.create({
      data: {
        branchId: result.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        userId: result.id,
        data: result,
        action: "UPDATED",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const UserId = Number(req.params.id);

    if (!UserId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User ID is missing in the request parameters",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: UserId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    const result = await prisma.user.update({
      where: {
        id: UserId,
      },
      data: {
        isActive: !existingUser.isActive,
      },
      include: {
        employee: true,
      },
    });

    await prisma.userLog.create({
      data: {
        branchId: result.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        userId: result.id,
        data: result,
        action: "UPDATED_STATUS",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// delete User Product
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const UserId = Number(req.params.id);
    if (!UserId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User ID is missing in the request parameters",
      });
    }

    const result = await prisma.user.delete({
      where: {
        id: UserId,
      },
      include: {
        employee: true,
      },
    });

    await prisma.userLog.create({
      data: {
        branchId: result.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        userId: result.id,
        data: result,
        action: "DELETED",
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { newPassword, confirmPassword, oldPassword } = req.body;
    const { id } = req.user;
    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        message: "New Password and Confirm Password do not match",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id },
      include: { employee: true },
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        message: "User Not Found",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        message: "Password Incorrect",
      });
    }
    const bcryptPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: bcryptPassword,
      },
    });

    await prisma.userLog.create({
      data: {
        branchId: user.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        userId: user.id,
        data: user,
        action: "PASSWORD_CHANGE",
      },
    });

    res.status(200).send({
      success: true,
      statusCode: 200,
      message: "Password Change Successfully",
    });
  } catch (err) {
    next(err);
  }
};
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findFirst({
      where: { id },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        isActive: true,
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        message: "User Not Found",
      });
    }

    res.status(200).send({
      success: true,
      statusCode: 200,
      message: "Profile Get Successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { newPassword, confirmPassword, code } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        message: "New Password and Confirm Password do not match",
      });
    }

    const user = await prisma.user.findFirst({ where: { verifiedCode: code } });

    if (!user) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        message: "User Not Found",
      });
    }

    const bcryptPassword = await bcrypt.hash(newPassword, 12);

    const result = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: bcryptPassword,
        verifiedCode: null,
      },
      include: {
        employee: true,
      },
    });

    await prisma.userLog.create({
      data: {
        branchId: result.employee.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: result.id,
        userId: result.id,
        data: result,
        action: "FORGET_PASSWORD_CHANGE",
      },
    });

    res.status(200).send({
      success: true,
      statusCode: 200,
      message: "Password Change Successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const { ...data } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User ID is missing in the request parameters",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    const result = await prisma.employee.update({
      where: {
        id: existingUser.employeeId,
      },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        nid: data.nid,
        image: data.image,
      },
    });

    await prisma.userLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        userId: result.id,
        data: result,
        action: "UPDATED_PROFILE",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
