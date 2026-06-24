import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { Image } from "../types/auth.types.js";

export interface IWorkspace extends Document {
  name: string;
  logo?: Image;
  ownerId: Types.ObjectId;
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
        public_alt: String,
      },
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    token: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  workspaceSchema,
);
