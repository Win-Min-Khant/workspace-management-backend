import { useQuery } from "@tanstack/react-query";
import { getProjectDetails } from "../api/projectApi";

export function useProjectDetails(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId, "projects", projectId],
    queryFn: () => getProjectDetails({ workspaceId, projectId }),
    enabled: Boolean(workspaceId) && Boolean(projectId),
  });
}
