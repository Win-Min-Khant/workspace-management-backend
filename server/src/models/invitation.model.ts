import mongoose, { Document, Schema, Types } from "mongoose";
import crypto from "crypto";

export interface IInvitation extends Document {
  email: string;
  role: "admin" | "member";
  workspaceId: Types.ObjectId;
  status: "pending" | "accepted";
  inviteToken: string;
  invitedBy: Types.ObjectId;
  inviteTokenExpiresAt: Date;
}

const invitationSchema = new mongoose.Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    inviteToken: {
      type: String,
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteTokenExpiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  },
);

export const Invitation = mongoose.model<IInvitation>(
  "Invitation",
  invitationSchema,
);
