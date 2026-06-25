import type { Types } from "mongoose";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";
import { deleteImage, uploadSingleImage } from "../utils/uploadToCloudinary.js";
import mongoose from "mongoose";
import { UserWorkspace } from "../models/user_workspace.model.js";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  workspaceName: string;
  name: string;
  image_url: string;
}

export class AuthService {
  // register
  static async register(data: RegisterDto) {
    const { name, email, password, workspaceName } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError(400, "Email already exists.");
    }

    // session starts
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const workspace = await Workspace.create([{ name: workspaceName }], {
        session,
      });
      const newWorkspace = workspace?.[0];
      if (!newWorkspace) throw new AppError(500, "Workspace creation failed.");
      const user = await User.create(
        [
          {
            name,
            email,
            password,
            // workspaceIds: [newWorkspace._id],
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
      await session.abortTransaction();
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
        // role: user.role,
        // workspaceIds: user.workspaceIds,
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
    const user = await User.findById(userId)
      .select("-password -refreshToken")
      .populate({
        path: "workspaceIds",
        select: "name logo",
      });

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    return user;
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
  static async uploadAvatar(userId: string, image_url: string) {
    const user = await User.findById(userId).select("-password -refresh_token");
    if (!user) {
      throw new AppError(404, "User not found.");
    }
    if (user.avatar?.image_url) {
      await deleteImage(user.avatar.public_alt);
    }
    const response = await uploadSingleImage(image_url, "jira-clone/avatar");
    const completedUser = await User.findByIdAndUpdate(user._id, {
      avatar: {
        image_url: response.image_url,
        public_alt: response.public_alt,
      },
    });
    const userToSendClient = await User.findById(completedUser?._id).select(
      "-password -refreshToken",
    );
    return userToSendClient;
  }
}
