import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { Image } from "../types/auth.types.js";

export interface IWorkspace extends Document {
  name: string;
  logo?: Image;
  token: string;
}

const workspaceSchema = new mongoose.Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: {
        image_url: String,
        public_id: String,
      },
    },
    token: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  workspaceSchema,
);
