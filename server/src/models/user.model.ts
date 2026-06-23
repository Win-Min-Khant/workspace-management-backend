import mongoose, { Document, Schema, Types } from "mongoose";
import type { Image, UserRole } from "../types/auth.types.js";
import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  workspaceId: Types.ObjectId;
  refreshToken: string;
  avatar?: Image;
  isPasswordMatch(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },

    avatar: {
      type: {
        image_url: String,
        public_alt: String,
      },
    },

    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    refreshToken: {
      type: String,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1, workspaceId: 1 }, { unique: true });

// handling password hashing before saving into database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// check user password match or not with the previous one
userSchema.methods.isPasswordMatch = async function (enterPassword: string) {
  return await bcrypt.compare(enterPassword, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
  const secretKey = process.env.JWT_ACCESS_TOKEN_SECRET_KEY as Secret;
  const accessExpiresIn =
    (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as StringValue) ||
    ("15m" as StringValue);
  const options: SignOptions = {
    expiresIn: accessExpiresIn,
  };

  return jwt.sign(
    {
      userId: this._id,
      workspaceId: this.workspaceId,
      role: this.role,
    },
    secretKey,
    options,
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET_KEY as Secret;
  const refreshExpiresIn =
    (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue) ||
    ("7d" as StringValue);
  const refreshOptions: SignOptions = {
    expiresIn: refreshExpiresIn,
  };

  return jwt.sign(
    {
      userId: this._id,
    },
    refreshSecret,
    refreshOptions,
  );
};

export const User = mongoose.model<IUser>("User", userSchema);
