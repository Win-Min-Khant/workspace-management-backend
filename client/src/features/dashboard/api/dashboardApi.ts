import { apiClient } from "@/utils/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface OwnerDashboardData {
  totalMembers: number;
  totalProjects: number;
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}

export interface MemberDashboardProject {
  _id: string;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface MemberDashboardData {
  assignedProjects: {
    count: number;
    projects: MemberDashboardProject[];
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
  };
}

export type DashboardData = OwnerDashboardData | MemberDashboardData;

// role-based shape check — owner/admin responses have totalMembers, member responses don't
export function isOwnerDashboard(
  data: DashboardData,
): data is OwnerDashboardData {
  return "totalMembers" in data;
}

export async function getDashboard(
  workspaceId: string,
): Promise<DashboardData> {
  const response = await apiClient.get<ApiResponse<DashboardData>>(
    `/workspaces/${workspaceId}/dashboard`,
  );
  return response.data.data;
}
