import { validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]?.msg as string;
    return next(new AppError(400, firstError));
  }

  next();
};
