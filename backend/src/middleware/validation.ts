import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError, z } from "zod";

// Generic function type for middleware factory
type ValidationMiddleware = (schema: ZodSchema<any>) => RequestHandler;

export const verifyBody: ValidationMiddleware = (schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
};


export const verifyParams: ValidationMiddleware = (schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      const err = error as ZodError;
      res.status(400).json({
        success: false,
        errors: err.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
  };
};

export const verifyQuery: ValidationMiddleware = (schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      const err = error as ZodError;
      res.status(400).json({
        success: false,
        errors: err.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
  };
};

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
