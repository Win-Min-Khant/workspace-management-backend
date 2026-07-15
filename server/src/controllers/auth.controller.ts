import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

// @route POST | api/auth/register
// @desc Register new user
// @access Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const avatarFile = files?.avatar?.[0];
  const logoFile = files?.logo?.[0];
  const result = await AuthService.register(req.body, avatarFile, logoFile);
  res.status(201).json({
    success: true,
    data: result,
  });
});

// @route POST | api/auth/login
// @desc Login to an existing account
// @access Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// @route POST | api/auth/refresh
// @desc Regenerate tokens
// @access Public
export const generateTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await AuthService.regenerateTokens(refreshToken as string);
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// @route POST | api/auth/logout
// @desc Logout from existing account
// @access Private
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(401, "Not Authorized.");
  }

  const result = await AuthService.logout(userId.toString());
  res.status(200).json({
    success: true,
    data: result,
  });
});

// @route GET | api/auth/profile
// @desc Get Profile
// @access Private
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.userId;
    const profile = await AuthService.getProfile(
      workspaceId as string,
      userId as string,
    );
    res.status(200).json({
      success: true,
      data: profile,
    });
  },
);

// @route PUT | api/auth/profile
// @desc Update Name
// @access Private
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name } = req.body;
    const userId = req.user?.userId as string;

    if (!userId) throw new AppError(401, "Unauthorized.");

    const result = await AuthService.updateProfile(userId, name);

    res.status(200).json({ success: true, data: result });
  },
);

// @route POST | api/auth/upload
// @desc upload or update user's avatar
// @access Private
export const uploadAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;

    if (!req.file) throw new AppError(400, "Avatar file is required.");

    const result = await AuthService.updateAvatar(userId, req.file);

    res.status(200).json({ success: true, data: result });
  },
);
