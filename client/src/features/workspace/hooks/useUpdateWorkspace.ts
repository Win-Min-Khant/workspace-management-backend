import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateWorkspace } from "../api/workspaceApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", "me"] });
      toast.success("Workspace updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
