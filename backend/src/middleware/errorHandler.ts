import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import createError from 'http-errors';
import { ZodError } from 'zod';
import config from '../config';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import handleValidationError from './handleValidationError';
import handleClientError from './handlePrismaClientError';

export const notfoundandler: RequestHandler = (req, res, next) => {
  next(createError.NotFound());
};

const errorHandler: ErrorRequestHandler = async (
  err,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = 400;
  let message: string = err.message;
  let errorMessage: any;

  if (err instanceof ZodError) {
    const zodErr = err as ZodError<any>;
    statusCode = 400;
    message = 'Validation Error';
    //@ts-ignore
    errorMessage = zodErr.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  } else if (err instanceof PrismaClientValidationError) {
    const error = handleValidationError(err);
    statusCode = error.statusCode;
    message = error.message;
    errorMessage = error.errorMessages;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const error = handleClientError(err);
    statusCode = error.statusCode;
    message = error.message;
    errorMessage = [
      {
        path: '',
        message: error.errorMessages,
      },
    ];
  } else if (err instanceof createError.HttpError) {
    statusCode = err.statusCode || 500;
    message = err.message;
  } else {
    statusCode = err.status || 500;
    message = err.message || 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessage,
    stack: config.env !== 'production' ? err?.stack : undefined,
  });
};

export default errorHandler;
