import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IActivity extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  targetId: mongoose.Types.ObjectId;
  targetType: "TASK" | "PROJECT" | "USER" | "WORKSPACE";
  details?: string;
}

const activitySchema = new mongoose.Schema<IActivity>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["TASK", "PROJECT", "USER", "WORKSPACE"],
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const ActivityLog = mongoose.model<IActivity>(
  "ActivityLog",
  activitySchema,
);
