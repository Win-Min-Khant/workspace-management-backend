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
  email: string;
  password: string;
}

export class AuthService {
  // register
  static async register(
    data: RegisterDto,
    avatarFile?: Express.Multer.File,
    logoFile?: Express.Multer.File,
  ) {
    const { name, email, password, workspaceName } = data;

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
        {
          session,
        },
      );
      const newWorkspace = workspace?.[0];
      if (!newWorkspace) throw new AppError(500, "Workspace creation failed.");
      const user = await User.create(
        [
          {
            name,
            email,
            password,
            ...(avatar && { avatar }),
          },
        ],
        { session },
      );

      const newUser = user?.[0];
      if (!newUser) throw new AppError(500, "User creation failed.");

      await Workspace.findByIdAndUpdate(
        newWorkspace._id,
        { ownerId: newUser._id },
        { session },
      );

      await UserWorkspace.create({
        userId: newUser._id,
        workspaceId: newWorkspace._id,
        role: "owner",
      });

      await session.commitTransaction();

      const secureUser = await User.findById(newUser._id).select("-password");
      return { user: secureUser, workspace: newWorkspace };
    } catch (error) {
      const cleanupTasks = [
        avatar?.public_id
          ? deleteImage(avatar.public_id)
          : Promise.resolve(null),
        logo?.public_id ? deleteImage(logo.public_id) : Promise.resolve(null),
      ];

      await Promise.allSettled(cleanupTasks).then((results) => {
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

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      throw new AppError(401, "Invalid credentials.");
    }

    const isMatch = await user.isPasswordMatch(password);

    if (!isMatch) {
      throw new AppError(401, "Invalid credentials.");
    }

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

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
    if (!refreshToken) {
      throw new AppError(401, "Refresh token required.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY!,
    ) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError(401, "Invalid session.");
    }

    const newAccessToken = user.generateAccessToken();

    await user.save({
      validateBeforeSave: false,
    });

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

  // profile
  static async getProfile(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new AppError(404, "User not found.");
    }

    const workspaces = await UserWorkspace.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).populate("workspaceId");

    return {
      user,
      workspaces,
    };
  }

  // update name
  static async updateName(userId: string, name: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true },
    ).select("-password -refreshToken");
    return user;
  }

  // update or upload user's avatar
  // static async uploadAvatar(userId: string, image_url: string) {
  //   const user = await User.findById(userId).select("-password -refresh_token");
  //   if (!user) {
  //     throw new AppError(404, "User not found.");
  //   }
  //   if (user.avatar?.image_url) {
  //     await deleteImage(user.avatar.public_id);
  //   }
  //   const response = await uploadToCloudinary(image_url, "jira-clone/avatar");
  //   const completedUser = await User.findByIdAndUpdate(user._id, {
  //     avatar: {
  //       image_url: response.image_url,
  //       public_alt: response.public_alt,
  //     },
  //   });
  //   const userToSendClient = await User.findById(completedUser?._id).select(
  //     "-password -refreshToken",
  //   );
  //   return userToSendClient;
  // }
}
