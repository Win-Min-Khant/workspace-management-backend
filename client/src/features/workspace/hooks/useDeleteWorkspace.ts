import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { deleteWorkspace } from "../api/workspaceApi";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useDeleteWorkspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", "me"] });
      localStorage.removeItem("lastWorkspaceId");
      toast.success("Workspace deleted");
      navigate("/redirect");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
