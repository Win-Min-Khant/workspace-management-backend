import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { InvitationService } from "../services/invitation.service.js";
import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";

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
    const token = req.params.token;
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          process.env.JWT_ACCESS_TOKEN_SECRET_KEY!,
        ) as any;
        userId = decoded.userId;
      } catch (error) {
        throw new AppError(401, "Invalid Token");
      }
    }
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You need an account to join this workspace.",
        action: "Please register to accept this invitation.",
      });
    }
    const result = await InvitationService.acceptInvitation(
      token as string,
      userId as string,
    );
    res.status(200).json({ success: true, data: result });
  },
);
