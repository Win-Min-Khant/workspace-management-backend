import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { updateMemberRole } from "../api/workspaceApi";

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberRole,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "members"],
      });
      toast.success("Member role updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
