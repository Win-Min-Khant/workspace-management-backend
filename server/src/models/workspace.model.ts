import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { Image } from "../types/auth.types.js";

export interface IWorkspace extends Document {
  name: string;
  logo?: Image;
  ownerId: Types.ObjectId;
  token: string;
  members: [
    {
      userId: string | Types.ObjectId;
      role: "admin" | "member";
    },
  ];
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
    token: { type: String },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  workspaceSchema,
);
