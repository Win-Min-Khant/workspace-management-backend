import type { Types } from "mongoose";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";
import {
  deleteImage,
  uploadToCloudinary,
} from "../utils/uploadToCloudinary.js";
import mongoose from "mongoose";
import { UserWorkspace } from "../models/user_workspace.model.js";
import type { Image } from "../types/auth.types.js";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  workspaceName: string;
  name: string;
}

export interface CloudImage {
  secure_url: string;
  public_id: string;
}

export class AuthService {
  // register
  static async register(
    data: RegisterDto,
    avatarFile?: Express.Multer.File,
    logoFile?: Express.Multer.File,
  ) {
    const { name, email, password, workspaceName } = data;

    // check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError(400, "Email already exists.");
    }

    // avatar upload
    let avatar: Image | undefined;
    let logo: Image | undefined;

    const [avatarResult, logoResult] = (await Promise.all([
      avatarFile
        ? uploadToCloudinary(avatarFile.buffer, "users/avatars")
        : Promise.resolve(null),
      logoFile
        ? uploadToCloudinary(logoFile.buffer, "workspaces/logos")
        : Promise.resolve(null),
    ])) as [
      { secure_url: string; public_id: string },
      { secure_url: string; public_id: string },
    ];

    if (avatarResult) {
      avatar = {
        image_url: avatarResult.secure_url,
        public_id: avatarResult.public_id,
      };
    }

    if (logoResult) {
      logo = {
        image_url: logoResult.secure_url,
        public_id: logoResult.public_id,
      };
    }

    // session starts
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const workspace = await Workspace.create(
        [{ name: workspaceName, ...(logo && { logo }) }],
        { session },
      );
      const newWorkspace = workspace?.[0];
      if (!newWorkspace) throw new AppError(500, "Workspace creation failed.");

      const user = await User.create(
        [{ name, email, password, ...(avatar && { avatar }) }],
        { session },
      );
      const newUser = user?.[0];
      if (!newUser) throw new AppError(500, "User creation failed.");

      // await Workspace.findByIdAndUpdate(
      //   newWorkspace._id,
      //   { ownerId: newUser._id },
      //   { session },
      // );

      await UserWorkspace.create(
        [{ userId: newUser._id, workspaceId: newWorkspace._id, role: "owner" }],
        { session },
      );

      await session.commitTransaction();

      const secureUser = await User.findById(newUser._id).select("-password");
      return { user: secureUser, workspace: newWorkspace };
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      await Promise.allSettled([
        avatar?.public_id
          ? deleteImage(avatar.public_id)
          : Promise.resolve(null),
        logo?.public_id ? deleteImage(logo.public_id) : Promise.resolve(null),
      ]).then((results) => {
        results.forEach((r) => {
          if (r.status === "rejected") {
            console.error("Cloudinary cleanup failed:", r.reason);
          }
        });
      });

      throw error;
    } finally {
      session.endSession();
    }
  }

  // login
  static async login(data: LoginDto) {
    const { email, password } = data;

    // check if user exists
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      throw new AppError(401, "Invalid email.");
    }

    // check if password matches
    const isMatch = await user.isPasswordMatch(password);

    if (!isMatch) {
      throw new AppError(401, "Invalid password.");
    }

    // generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save refresh token to user document
    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // generate both access and refresh token
  static async regenerateTokens(refreshToken: string) {
    // check if refresh token is provided
    if (!refreshToken) {
      throw new AppError(401, "Refresh token required.");
    }

    // verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY!,
    ) as {
      userId: string;
    };

    // check if user exists and refresh token matches
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError(401, "Invalid session.");
    }

    // generate new access token
    const newAccessToken = user.generateAccessToken();

    return {
      accessToken: newAccessToken,

      refreshToken: user.refreshToken,
    };
  }

  // logout
  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
    });

    return {
      message: "Logged out successfully.",
    };
  }

  // profile details
  static async getProfile(workspaceId: string, userId: string) {
    const userInfo = await UserWorkspace.findOne({ userId, workspaceId })
      .populate("userId", "name email avatar")
      .populate("workspaceId", "name logo");

    if (!userInfo) throw new AppError(404, "Profile not found.");

    return {
      name: (userInfo.userId as any).name,
      email: (userInfo.userId as any).email,
      avatar: (userInfo.userId as any).avatar,
      role: userInfo.role,
      workspace: {
        name: (userInfo.workspaceId as any).name,
        logo: (userInfo.workspaceId as any).logo,
      },
    };
  }

  // update profile
  static async updateProfile(userId: string, name: string) {
    if (!name) throw new AppError(400, "No update data provided.");

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name } },
      { returnDocument: "after" },
    ).select("-password -refreshToken");

    if (!user) throw new AppError(404, "User not found.");
    return user;
  }

  // update avatar
  static async updateAvatar(
    userId: string,
    avatarToUpdate: Express.Multer.File,
  ) {
    if (!avatarToUpdate) throw new AppError(400, "Avatar file is required.");

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) throw new AppError(404, "User not found.");

    const uploadedAvatar = (await uploadToCloudinary(
      avatarToUpdate.buffer,
      "users/avatars",
    )) as CloudImage;

    // console.log("Uploaded new avatar:", uploadedAvatar.public_id);

    const newAvatar: Image = {
      image_url: uploadedAvatar.secure_url,
      public_id: uploadedAvatar.public_id,
    };

    const oldPublicId = user.avatar?.public_id;
    if (oldPublicId) {
      await deleteImage(oldPublicId).catch((err) => {
        console.error("Old avatar cleanup failed:", oldPublicId, err);
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: newAvatar },
      { returnDocument: "after" },
    ).select("-password -refreshToken");

    if (!updatedUser) throw new AppError(500, "Failed to update avatar.");
    return updatedUser;
  }
}
