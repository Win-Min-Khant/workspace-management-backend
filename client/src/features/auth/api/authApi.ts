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

export const loginUser = async (
  data: LoginInputs,
): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    "/auth/login",
    data,
  );
  return response.data.data;
};

export const registerUser = async (
  data: RegisterInputs,
): Promise<RegisterResponseData> => {
  const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
    "/auth/register",
    data,
  );
  return response.data.data;
};

export const userProfile = async (
  workspaceId: string,
): Promise<ProfileResponseData> => {
  const response = await apiClient.get<ApiResponse<ProfileResponseData>>(
    `/auth/${workspaceId}/profile`,
  );
  return response.data.data;
};

export const logoutUser = async () => {
  await apiClient.delete<ApiResponse<boolean>>("/auth/logout");
};
