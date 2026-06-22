import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

// @route POST | api/auth/register
// @desc Register new user
// @access Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
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
    const profile = await AuthService.getProfile(req.user?.userId as string);
    res.status(200).json({
      success: true,
      data: profile,
    });
  },
);

// @route PUT | api/auth/profile
// @desc Update Name
// @access Private
export const updateName = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name } = req.body;
    const result = await AuthService.updateName(
      req.user?.userId as string,
      name,
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// @route POST | api/auth/upload
// @desc upload or update user's avatar
// @access Private
export const uploadAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { image_url } = req.body;
    const result = await AuthService.uploadAvatar(
      req.user?.userId as string,
      image_url,
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);
