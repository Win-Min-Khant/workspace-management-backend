import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  logo?: string;
  ownerId: Types.ObjectId;
}

const workspaceSchema = new mongoose.Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  workspaceSchema,
);
