import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import mongoose from "mongoose";

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
    } else if (req.body?.accessToken) {
      token = req.body.accessToken;
    }

    if (!token) {
      throw new AppError(401, "Not Authorized.");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY!,
      ) as JwtPayload & { userId?: string };

      if (!decoded?.userId) {
        throw new AppError(401, "Not Authorized. Invalid Token.");
      }

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
    } catch (error) {
      throw new AppError(401, "Not Authorized. Invalid Token.");
    }
  },
);

// @desc Middleware to check if user is owner
export const isOwner = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const userId = req.user?.userId;

    const membership = await UserWorkspace.findOne({
      userId: new mongoose.Types.ObjectId(userId as string),
      workspaceId: new mongoose.Types.ObjectId(workspaceId as string),
      role: "owner",
    });

    if (!membership) {
      throw new AppError(403, "You are not the owner of this workspace.");
    }

    next();
  },
);

// @desc Middleware to check if user is admin
export const isAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const userId = req.user?.userId;

    const membership = await UserWorkspace.findOne({
      userId: new mongoose.Types.ObjectId(userId as string),
      workspaceId: new mongoose.Types.ObjectId(workspaceId as string),
      role: "admin",
    });

    if (!membership) {
      throw new AppError(403, "You are not the owner of this workspace.");
    }
    next();
  },
);

// @desc Middleware to check if user is admin and owner
export const isOwnerOrAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const userId = req.user?.userId;

    const membership = await UserWorkspace.findOne({
      userId: new mongoose.Types.ObjectId(userId as string),
      workspaceId: new mongoose.Types.ObjectId(workspaceId as string),
    });

    if (
      !membership ||
      (membership.role !== "owner" && membership.role !== "admin")
    ) {
      throw new AppError(
        403,
        "You do not have permission to perform this action.",
      );
    }

    // if (membership.role !== "owner") {
    //   throw new AppError(403, "Only owners can assign admin roles.");
    // }
    next();
  },
);

// @desc Middleware to check if user is member
export const isMember = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const userId = req.user?.userId;

    const membership = await UserWorkspace.findOne({
      userId: new mongoose.Types.ObjectId(userId as string),
      workspaceId: new mongoose.Types.ObjectId(workspaceId as string),
    });

    if (!membership) {
      throw new AppError(403, "You do not have access to this workspace.");
    }

    // (req as any).membership = membership;

    next();
  },
);
