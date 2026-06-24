import type { Response } from "express";
import type { AuthRequest } from "../middlewares/protect.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { InvitationService } from "../services/invitation.service.js";

export const sendInvitation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { emails, workspaceId, role } = req.body;
    const invitedBy = req.user?.userId;
    const result = await InvitationService.sendInvitation(
      emails,
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
