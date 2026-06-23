import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  status: "planning" | "active" | "completed";
  workspaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  members: [Types.ObjectId];
}

const projectSchema = new mongoose.Schema<IProject>({
  name: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ["planning", "active", "completed"],
    default: "planning",
  },
  workspaceId: {
    type: Schema.ObjectId,
    ref: "Workspace",
    required: true,
    index: true,
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

export const Project = mongoose.model<IProject>("Project", projectSchema);
