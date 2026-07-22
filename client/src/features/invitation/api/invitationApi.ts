import { apiClient } from "@/utils/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface SendInvitationPayload {
  workspaceId: string;
  email: string;
  role: "admin" | "member";
}

export interface InvitationResponseData {
  _id: string;
  email: string;
  workspaceId: string;
  invitedBy: string;
  role: "admin" | "member";
  status: "pending" | "accepted";
  createdAt: string;
  updatedAt: string;
}

export async function sendInvitation(
  data: SendInvitationPayload,
): Promise<InvitationResponseData> {
  const response = await apiClient.post<ApiResponse<InvitationResponseData>>(
    `/invitation/${data.workspaceId}/invite`,
    { email: data.email, role: data.role },
  );
  return response.data.data;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface VerifyInvitationResponse {
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted";
  workspace: {
    id: string;
    name: string;
    logo: string | null;
  };
}

export async function verifyInvitation(
  token: string,
): Promise<VerifyInvitationResponse> {
  const response = await apiClient.get<ApiResponse<VerifyInvitationResponse>>(
    `/invitation/verify/${token}`,
  );
  return response.data.data;
}

export interface AcceptInvitationPayload {
  token: string;
  name?: string;
  password?: string;
}

export interface AcceptInvitationResponse {
  workspaceId: string;
  userId: string;
}

export async function acceptInvitation(
  data: AcceptInvitationPayload,
): Promise<AcceptInvitationResponse> {
  const response = await apiClient.post<ApiResponse<AcceptInvitationResponse>>(
    `/invitation/accept/${data.token}`,
    { name: data.name, password: data.password },
  );
  return response.data.data;
}
