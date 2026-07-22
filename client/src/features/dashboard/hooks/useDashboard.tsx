import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboardApi";

export function useDashboard(workspaceId: string) {
  return useQuery({
    queryKey: ["dashboard", workspaceId],
    queryFn: () => getDashboard(workspaceId),
    enabled: Boolean(workspaceId),
  });
}
