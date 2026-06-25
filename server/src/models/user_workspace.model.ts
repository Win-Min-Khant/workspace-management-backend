import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IUWorkspace extends Document {
  userId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  role: "admin" | "member";
}

const userWorkspaceSchema = new mongoose.Schema<IUWorkspace>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  {
    timestamps: true,
  },
);

export const UserWorkspace = mongoose.model<IUWorkspace>(
  "UserWorkspace",
  userWorkspaceSchema,
);
