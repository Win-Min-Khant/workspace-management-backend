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
