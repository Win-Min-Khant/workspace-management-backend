import { apiClient } from "@/utils/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface WorkspaceLogo {
  image_url: string;
  public_id: string;
  _id: string;
}

interface Workspace {
  _id: string;
  name: string;
  logo?: WorkspaceLogo;
}

export interface MyWorkspace {
  workspace: Workspace;
  role: "owner" | "admin" | "member";
}

export interface WorkspaceDetailResponse {
  workspace: {
    _id: string;
    name: string;
    logo?: {
      image_url: string;
      public_alt: string;
    };
  };
  totalMembers: number;
  totalProjects: number;
  totalTasks: number;
}

export async function getMyWorkspaces(): Promise<MyWorkspace[]> {
  const response =
    await apiClient.get<ApiResponse<MyWorkspace[]>>("/workspaces/me");
  return response.data.data;
}

export async function getWorkspaceDetail(workspaceId: string) {
  const response = await apiClient.get<ApiResponse<WorkspaceDetailResponse>>(
    `/workspaces/${workspaceId}`,
  );

  return response.data.data;
}

export async function createWorkspace(data: {
  name: string;
  logo?: File;
}): Promise<{ workspace: Workspace }> {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.logo) {
    formData.append("logo", data.logo);
  }

  const response = await apiClient.post<ApiResponse<{ workspace: Workspace }>>(
    "/workspaces",
    formData,
  );
  return response.data.data;
}

export interface WorkspaceMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      image_url: string;
      public_id: string;
    };
  };
  role: "owner" | "admin" | "member";
  status: "active" | "suspended" | "invited";
}

export async function getWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const response = await apiClient.get<ApiResponse<WorkspaceMember[]>>(
    `/workspaces/${workspaceId}/members`,
  );
  return response.data.data;
}

export async function updateMemberRole(params: {
  workspaceId: string;
  memberId: string;
  role: "admin" | "member";
}): Promise<WorkspaceMember> {
  const response = await apiClient.patch<ApiResponse<WorkspaceMember>>(
    `/workspaces/${params.workspaceId}/members/${params.memberId}`,
    { role: params.role },
  );
  return response.data.data;
}

export async function deleteMember(params: {
  workspaceId: string;
  memberId: string;
}): Promise<{ message: string }> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/workspaces/${params.workspaceId}/members/${params.memberId}`,
  );
  return response.data.data;
}

export async function updateWorkspace(data: {
  workspaceId: string;
  name?: string;
  logo?: File;
}): Promise<Workspace> {
  const formData = new FormData();
  if (data.name) {
    formData.append("name", data.name);
  }
  if (data.logo) {
    formData.append("logo", data.logo);
  }

  const response = await apiClient.patch<ApiResponse<Workspace>>(
    `/workspaces/${data.workspaceId}`,
    formData,
  );
  return response.data.data;
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await apiClient.delete(`/workspaces/${workspaceId}`);
}
