import { useQuery } from "@tanstack/react-query";
import { getMyWorkspaces } from "../api/workspaceApi";

export function useMyWorkspaces() {
  return useQuery({
    queryKey: ["workspaces", "me"],
    queryFn: getMyWorkspaces,
    staleTime: 1000 * 60 * 5,
  });
}
