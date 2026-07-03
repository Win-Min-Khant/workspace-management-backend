import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";

interface AuthUser {
  userId: string | Types.ObjectId;
  name: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// @desc Middleware to check if user is logged in or not
export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw new AppError(401, "Not Authorized.");
    }

    // only wrap jwt.verify in try/catch — let real errors surface naturally
    let decoded: JwtPayload & { userId?: string };
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY!,
      ) as JwtPayload & { userId?: string };
    } catch {
      throw new AppError(401, "Not Authorized. Invalid Token.");
    }

    if (!decoded?.userId) {
      throw new AppError(401, "Not Authorized. Invalid Token.");
    }

    // DB calls outside try/catch — real errors surface as themselves
    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new AppError(401, "Not Authorized. User not found.");
    }

    req.user = {
      userId: decoded.userId,
      name: user.name,
      email: user.email,
    };

    next();
  },
);

// @desc Middleware to check user's role to have permission or not
export const requireRole = (...roles: Array<"owner" | "admin" | "member">) =>
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const userId = req.user?.userId;
    if (!workspaceId) {
      throw new AppError(400, "Workspace ID is required.");
    }

    if (!userId) {
      throw new AppError(401, "Not Authorized.");
    }

    const membership = await UserWorkspace.findOne({
      userId,
      workspaceId,
    });

    if (!membership) {
      throw new AppError(403, "You are not a member of this workspace.");
    }

    if (!roles.includes(membership.role)) {
      throw new AppError(
        403,
        "You do not have permission to perform this action.",
      );
    }

    next();
  });
