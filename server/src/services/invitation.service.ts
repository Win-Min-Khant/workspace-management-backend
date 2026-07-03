import mongoose, { Types } from "mongoose";
import { Invitation } from "../models/invitation.model.js";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { AppError } from "../utils/appError.js";
import { getInviteEmailTemplate } from "../utils/inviteEmailTemplate.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { generateEmailInviteToken } from "../utils/generateRandomToken.js";
import { UserWorkspace } from "../models/user_workspace.model.js";
import { Activity } from "./activity.service.js";
import type { Image } from "../types/auth.types.js";

export interface AcceptInvitationDto {
  token: string;
  name?: string;
  password?: string;
}

export class InvitationService {
  // send invitation
  static async sendInvitation(
    email: string,
    workspaceId: string,
    invitedBy: string,
    role: "admin" | "member",
  ) {
    try {
      const inviterMembership = await UserWorkspace.findOne({
        userId: invitedBy,
        workspaceId,
      });
      if (!inviterMembership) {
        throw new AppError(404, "Inviter not found in this workspace.");
      }

      if (inviterMembership.role === "admin" && role !== "member") {
        throw new AppError(403, "Admins can only invite users as members.");
      }

      const existingInvite = await Invitation.findOne({
        email,
        workspaceId,
        status: "pending",
      });
      if (existingInvite) {
        throw new AppError(
          400,
          "User has already been invited to this workspace.",
        );
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const alreadyMember = await UserWorkspace.findOne({
          userId: existingUser._id,
          workspaceId,
        });
        if (alreadyMember) {
          throw new AppError(
            400,
            "User is already a member of this workspace.",
          );
        }
      }

      const { token, hashedToken } = generateEmailInviteToken();
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
        status: "pending",
        inviteTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      const newInvite = await Invitation.findById(invite._id).select(
        "-inviteToken -inviteTokenExpiresAt",
      );
      if (!newInvite)
        throw new AppError(
          500,
          "Invitation was created but could not be retrieved.",
        );
      await Activity.logActivity(
        workspaceId,
        invitedBy,
        "USER_INVITED",
        newInvite._id.toString(),
        "USER",
        `Invited ${email} to the workspace.`,
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
      status: "pending",
    });
    if (!invitation)
      throw new AppError(400, "Invitation link is invalid or expired.");
    return invitation;
  }

  // accept invitation
  static async acceptInvitation(
    token: string,
    data: {
      token: string;
      name?: string;
      password?: string;
      userId?: string;
    },
  ) {
    const { name, password, userId } = data;
    const invitation = await InvitationService.verifyInviteToken(token);

    const workspaceExists = await Workspace.exists({
      _id: invitation.workspaceId,
    });
    if (!workspaceExists) throw new AppError(404, "Workspace not found.");

    let user;

    if (userId) {
      user = await User.findById(userId);
      if (!user) throw new AppError(404, "User not found.");

      if (user.email !== invitation.email) {
        throw new AppError(
          403,
          "This invitation was sent to a different email address.",
        );
      }
    } else {
      if (!name || !password) {
        throw new AppError(
          400,
          "Name and password are required to create your account.",
        );
      }
      const existingUser = await User.findOne({ email: invitation.email });
      if (existingUser) {
        throw new AppError(
          400,
          "An account with this email already exists. Please log in to accept the invitation.",
        );
      }
      user = await User.create({
        name,
        email: invitation.email,
        password,
      });
    }

    // rest of the flow stays the same as before
    const alreadyMember = await UserWorkspace.findOne({
      userId: user._id,
      workspaceId: invitation.workspaceId,
    });
    if (alreadyMember) {
      throw new AppError(400, "You are already a member of this workspace.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await UserWorkspace.create(
        [
          {
            userId: user._id,
            workspaceId: invitation.workspaceId,
            role: invitation.role,
          },
        ],
        { session },
      );

      await User.findByIdAndUpdate(
        user._id,
        { lastAccessedWorkspaceId: invitation.workspaceId },
        { session },
      );

      await Invitation.findByIdAndUpdate(
        invitation._id,
        { status: "accepted" },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    await Activity.logActivity(
      invitation.workspaceId.toString(),
      user._id.toString(),
      "USER_JOINED",
      invitation._id.toString(),
      "USER",
      `${user.email} accepted the invitation and joined the workspace.`,
    );

    return { workspaceId: invitation.workspaceId, userId: user._id };
  }

  static async verifyInvitation(token: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const invitation = await Invitation.findOne({
      inviteToken: hashedToken,
      inviteTokenExpiresAt: { $gt: new Date() },
      status: "pending",
    }).populate<{
      workspaceId: { _id: Types.ObjectId; name: string; logo?: Image };
    }>("workspaceId", "name logo");

    if (!invitation) {
      throw new AppError(400, "Invitation link is invalid or has expired.");
    }

    return {
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      workspace: {
        id: invitation.workspaceId._id,
        name: invitation.workspaceId.name,
        logo: invitation.workspaceId.logo?.image_url || null,
      },
    };
  }
}
