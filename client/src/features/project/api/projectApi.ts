import { apiClient } from "@/utils/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface CreatedBy {
  _id: string;
  name: string;
  email: string;
  avatar?: { image_url: string };
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "completed";
  workspaceId: string;
  createdBy: CreatedBy;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  _id: string;
  projectId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: { image_url: string };
  };
}

export interface ProjectTask {
  _id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assigneeId?: {
    _id: string;
    name: string;
    avatar?: { image_url: string };
  };
}

export interface ProjectDetailsResponse {
  project: Project;
  members: ProjectMember[];
  tasks: ProjectTask[];
}

// list projects, with optional search/status filter
export async function getProjects(params: {
  workspaceId: string;
  search?: string;
  status?: string;
}): Promise<Project[]> {
  const response = await apiClient.get<ApiResponse<Project[]>>(
    `/workspaces/${params.workspaceId}/projects`,
    { params: { search: params.search, status: params.status } },
  );
  return response.data.data;
}

export async function getProjectDetails(params: {
  workspaceId: string;
  projectId: string;
}): Promise<ProjectDetailsResponse> {
  const response = await apiClient.get<ApiResponse<ProjectDetailsResponse>>(
    `/workspaces/${params.workspaceId}/projects/${params.projectId}`,
  );
  return response.data.data;
}

export async function createProject(params: {
  workspaceId: string;
  name: string;
  description?: string;
  status?: "planning" | "active" | "completed";
  startDate?: string;
  endDate?: string;
}): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>(
    `/workspaces/${params.workspaceId}/projects`,
    {
      name: params.name,
      description: params.description,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
    },
  );
  return response.data.data;
}

export async function updateProject(params: {
  workspaceId: string;
  projectId: string;
  name?: string;
  description?: string;
  status?: "planning" | "active" | "completed";
  startDate?: string;
  endDate?: string;
}): Promise<Project> {
  const { workspaceId, projectId, ...body } = params;
  const response = await apiClient.patch<ApiResponse<Project>>(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    body,
  );
  return response.data.data;
}

export async function deleteProject(params: {
  workspaceId: string;
  projectId: string;
}): Promise<void> {
  await apiClient.delete(
    `/workspaces/${params.workspaceId}/projects/${params.projectId}`,
  );
}

export async function manageProjectMember(params: {
  workspaceId: string;
  projectId: string;
  userIdToAssign: string;
  action: "add" | "remove";
}): Promise<void> {
  await apiClient.post(
    `/workspaces/${params.workspaceId}/projects/${params.projectId}/members`,
    { userIdToAssign: params.userIdToAssign, action: params.action },
  );
}
