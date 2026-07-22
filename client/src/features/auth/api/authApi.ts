import { apiClient } from "@/utils/axios";
import type { LoginInputs } from "@/schema/Login";
import type { RegisterInputs } from "@/schema/Register";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RegisterResponseData {
  user: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
  workspace: {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface Avatar {
  _id: string;
  image_url: string;
  public_id: string;
}

interface Workspace {
  name: string;
  logo?: Avatar;
}

interface ProfileResponseData {
  name: string;
  email: string;
  avatar?: Avatar;
  role: "owner" | "admin" | "member";
  workspace: Workspace;
}

export interface UpdatedUserAvatar {
  userId: string;
  avatar?: File;
}

export interface UpdateNamePayload {
  userId: string;
  name: string;
}

export interface UpdateUserProfileResponseData {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  avatar?: Avatar;
}

// Login
export const loginUser = async (
  data: LoginInputs,
): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    "/auth/login",
    data,
  );
  return response.data.data;
};

// Register
export const registerUser = async (
  data: RegisterInputs,
): Promise<RegisterResponseData> => {
  const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
    "/auth/register",
    data,
  );
  return response.data.data;
};

// Get User Profile
export const userProfile = async (
  workspaceId: string,
): Promise<ProfileResponseData> => {
  const response = await apiClient.get<ApiResponse<ProfileResponseData>>(
    `/auth/${workspaceId}/profile`,
  );
  return response.data.data;
};

// Logout
export const logoutUser = async () => {
  await apiClient.delete<ApiResponse<boolean>>("/auth/logout");
};

// Update Name
export const updateName = async (
  data: UpdateNamePayload,
): Promise<UpdateUserProfileResponseData> => {
  const response = await apiClient.patch<
    ApiResponse<UpdateUserProfileResponseData>
  >("/auth/profile/update-profile", data);
  return response.data.data;
};

// Update Avatar
export const updateAvatar = async (
  data: UpdatedUserAvatar,
): Promise<UpdateUserProfileResponseData> => {
  const formData = new FormData();
  formData.append("userId", data.userId);
  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }
  const response = await apiClient.patch<
    ApiResponse<UpdateUserProfileResponseData>
  >("/auth/profile/update-avatar", formData);
  return response.data.data;
};
