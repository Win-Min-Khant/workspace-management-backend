import { useQuery } from "@tanstack/react-query";
import { userProfile } from "../api/authApi";

export function useProfile(workspaceId: string) {
  return useQuery({
    queryKey: ["userProfile", workspaceId],
    queryFn: () => userProfile(workspaceId),
    enabled: !!workspaceId,
  });
}
