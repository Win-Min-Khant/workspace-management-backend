import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projectApi";

export function useProjects(
  workspaceId: string,
  search?: string,
  status?: string,
) {
  return useQuery({
    queryKey: ["workspace", workspaceId, "projects", { search, status }],
    queryFn: () => getProjects({ workspaceId, search, status }),
    enabled: Boolean(workspaceId),
  });
}
