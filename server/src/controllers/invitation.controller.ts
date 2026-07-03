import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { InvitationService } from "../services/invitation.service.js";
import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";
import { UserWorkspace } from "../models/user_workspace.model.js";

// @route POST | api/api/invitation/:workspaceId/send
// @desc Send invitation to admin and member with role access
// @access Private (Owner or Admin)
export const sendInvitation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email, role } = req.body;
    const invitedBy = req.user?.userId;
    const workspaceId = req.params.workspaceId;
    const result = await InvitationService.sendInvitation(
      email,
      workspaceId as string,
      invitedBy as string,
      role,
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// @route POST | api/invitation/accept/:token
// @desc Accept invitation
// @access Private (Owner or Admin)
export const acceptInvitation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;
    const { name, password } = req.body || {};

    let existingUserId: string | undefined;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          process.env.JWT_ACCESS_TOKEN_SECRET_KEY!,
        ) as { userId: string };
        existingUserId = decoded.userId;
      } catch {
        existingUserId = undefined;
      }
    }

    const result = await InvitationService.acceptInvitation(token as string, {
      token: token as string,
      name: name as string,
      password: password as string,
      userId: existingUserId as string,
    });

    res.status(200).json({ success: true, data: result });
  },
);

export const verifyInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;
    if (!token) throw new AppError(400, "Token is required.");

    const result = await InvitationService.verifyInvitation(token as string);

    res.status(200).json({ success: true, data: result });
  },
);
