// Invitation Model (Epic 3 အတွက်)

import mongoose, { Document, Schema, Types } from "mongoose";

export interface IInvitation extends Document {
  email: string;
  role: "admin" | "member";
  workspaceId: Types.ObjectId;
  status: "pending" | "accepted";
  token: string;
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
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    token: {
      type: String,
      required: true,
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
