import { useQuery } from "@tanstack/react-query";
import { getWorkspaceDetail } from "../api/workspaceApi";

export function useWorkspaceDetail(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaceDetail", workspaceId],
    queryFn: () => getWorkspaceDetail(workspaceId),
    enabled: !!workspaceId,
  });
}
