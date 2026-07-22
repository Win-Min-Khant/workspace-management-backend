import { useQuery } from "@tanstack/react-query";
import { getWorkspaceDetail } from "../api/workspaceApi";

export function useWorkspaceDetails(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceDetail(workspaceId),
    enabled: Boolean(workspaceId),
  });
}
