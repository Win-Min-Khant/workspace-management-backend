import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { manageProjectMember } from "../api/projectApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useManageProjectMember(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: manageProjectMember,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "projects", projectId],
      });
      toast.success(
        variables.action === "add"
          ? "Member added to project"
          : "Member removed from project",
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
