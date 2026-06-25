import mongoose from "mongoose";
import { Invitation } from "../models/invitation.model.js";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { AppError } from "../utils/appError.js";
import { getInviteEmailTemplate } from "../utils/inviteEmailTemplate.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { generateEmailInviteToken } from "../utils/generateRandonToken.js";
import { UserWorkspace } from "../models/user_workspace.model.js";

export class InvitationService {
  // send invitation
  static async sendInvitation(
    email: string,
    workspaceId: string,
    invitedBy: string,
    role: "admin" | "member",
  ) {
    const { token, hashedToken } = generateEmailInviteToken();
    try {
      const inviteUrl = `${process.env.CLIENT_URL}/accept-invitation/${token}`;
      await sendEmail({
        email,
        subject: "Invitation Request",
        html: getInviteEmailTemplate(inviteUrl),
      });
      const invite = await Invitation.create({
        email,
        workspaceId,
        inviteToken: hashedToken,
        invitedBy,
        role,
        inviteTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      const newInvite = await Invitation.findById(invite._id).select(
        "-inviteToken -inviteTokenExpiresAt",
      );
      return newInvite;
    } catch (error) {
      console.log(`Error at sending invite email: ${error}`);
      throw error;
    }
  }

  // verify token
  static async verifyInviteToken(token: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const invitation = await Invitation.findOne({
      inviteToken: hashedToken,
      inviteTokenExpiresAt: {
        $gt: new Date(),
      },
    });
    if (!invitation)
      throw new AppError(400, "Invitation link is invalid or expired.");
    return invitation;
  }

  // accept invitation
  static async acceptInvitation(token: string, userId: string) {
    const invitation = await InvitationService.verifyInviteToken(token);
    const workspace = await Workspace.findById(invitation.workspaceId);
    if (!workspace) throw new AppError(404, "Workspace not found.");
    if (!workspace.members.some((m) => m.userId.toString() === userId)) {
      await Workspace.updateOne(
        { _id: workspace._id },
        {
          $push: {
            members: {
              userId: new mongoose.Types.ObjectId(userId),
              role: invitation.role,
            },
          },
        },
      );
    }
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { workspaceIds: invitation.workspaceId } },
      { returnDocument: "after" },
    );
    await UserWorkspace.create({
      userId,
      workspaceId: invitation.workspaceId,
      role: invitation.role,
    });
    // await Invitation.findByIdAndDelete(invitation._id);
    await Invitation.findByIdAndUpdate(invitation._id, {
      status: "accepted",
    });
    return { workspaceId: invitation.workspaceId };
  }
}
