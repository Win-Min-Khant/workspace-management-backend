import type { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler = (
  controllerFn: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<any>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(controllerFn(req, res, next)).catch(next);
  };
};
