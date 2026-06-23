import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";

interface AuthUser {
  userId: string | Types.ObjectId;
  name: string;
  email: string;
  role: string;
  workspaceId: string | Types.ObjectId;
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
        role: user.role,
        workspaceId: user.workspaceId,
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
    const workspaceId = req.params.id;
    const userId = req.user?.userId;

    const workspace = await Workspace.findById(workspaceId);

    console.log("Workspace found:", workspace ? "Yes" : "No");
    console.log("Workspace Owner ID:", workspace?.ownerId.toString());
    console.log("Logged in User ID:", userId);

    if (!workspace || workspace.ownerId.toString() !== userId?.toString()) {
      throw new AppError(403, "You are not the owner of this workspace.");
    }

    next();
  },
);

// @desc Middleware to check if user is admin
export const isAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") {
      throw new AppError(403, "You have no permissions to make this action.");
    }
    next();
  },
);

// @desc Middleware to check if user is admin and owner
export const isOwnerOrAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "owner" && req.user?.role !== "admin") {
      throw new AppError(
        403,
        "Access denied. Owner or Admin permissions required.",
      );
    }
    next();
  },
);
